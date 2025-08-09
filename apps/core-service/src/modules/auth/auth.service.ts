import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO, LoginResDto } from './dto/login.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _401, _404 } from '@app/common/constants/errors-constants';
import { EUserStatus } from '../user/enums/user-status.enum';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ActivateAccount } from './dto/activate-account.dto';
import { BrainService } from '@app/common/brain/brain.service';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import {
  FAILED_LOGIN_ATTEMPT,
  RESET_PASSWORD_CACHE,
} from '@core-service/common/constants/brain.constants';
import { REFERRAL_CODE_CREDISTS } from '@core-service/common/constants/all.constants';
import {
  generateAlphaNumericCode,
  hashPassword,
  verifyAcademicEmailByDomain,
} from '@core-service/common/helpers/all.helpers';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { PaymentService } from '../payment/payment.service';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: CoreServiceConfigService,
    private readonly jwt: JwtService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
    private readonly configService: CoreServiceConfigService,
    private readonly portfolioService: PortfolioService,
    private readonly paymentService: PaymentService,
  ) {}
  async login(dto: LoginDTO): Promise<LoginResDto> {
    if (!(await this.userService.existByEmail(dto.email))) {
      this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }

    let user: User = await this.userService.findByEmail(dto.email);

    if (user.status === EUserStatus.NOT_VERIFIED)
      this.exceptionHandler.throwBadRequest(_401.ACCOUNT_NOT_VERIFIED);

    const key = `${FAILED_LOGIN_ATTEMPT.name}:${user.email}`;
    // const failedAttempts = await this.brainService.remindMe<number>(key);
    // console.log('dto---->', dto);

    // if (failedAttempts !== null && failedAttempts >= MAX_FAILED_ATTEMPTS) {
    //   this.exceptionHandler.throwUnauthorized(_401.ACCOUNT_LOCKED);
    // }

    const passwordsMatch = await bcrypt.compare(
      dto.password.toString(),
      user.password.toString(),
    );

    if (!passwordsMatch) {
      // await this.handleFailedLogin(key, failedAttempts);
      throw this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }

    const token = await this.getToken(user);
    user = plainToClass(User, user);
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.LOGIN_ATTEMPT,
      [user.email],
      {
        userName: user.firstName,
        message:
          'A new login to your account was detected. If this wasn’t you, please review your account activity.',
      },
    );
    await this.notifyOnPlatform({
      messageType: ENotificationMessageType.LOGIN_ATTEMPT,
      recipients: [{ userId: user.id }],
      subject: 'login action detected',
      metadata: {
        content: {
          title: 'login attempt', // commas added here
          subTitle: 'login attempt',
          description: `A new login to your account was detected. If this wasn’t you, please review your account activity.`,
          body: `A new login to your account was detected. If this wasn’t you, please review your account activity.`,
        },
        callToAction: {
          id: user.id,
        },
      },
    });
    return { token, user };
  }
  async verifyOtp(id: string, otp: number) {
    const isOtpValid = await this.verifyOTP(id, otp);
    if (!isOtpValid) this.exceptionHandler.throwBadRequest(_400.INVALID_OTP);
  }

  async verifyAccount(
    dto: ActivateAccount,
    isResetPassword: boolean = true,
  ): Promise<User | any> {
    const academicEmailVerfication = verifyAcademicEmailByDomain(dto.email);
    await this.verifyOtp(dto.email, dto.otp);
    if (!isResetPassword) {
      return true;
    }
    const cacheKey = this.brainService.getCacheKey(dto.email);
    const createUserDto: CreateUserDTO =
      await this.brainService.remindMe(cacheKey);

    const hashedPassword = await hashPassword(createUserDto?.password);

    const userEntity: User =
      await this.userService.getUserEntityFromDto(createUserDto);

    if (createUserDto.profilePicture) {
      if (createUserDto.profilePicture) {
        const raw = createUserDto.profilePicture;

        const file: Express.Multer.File = {
          fieldname: raw.fieldname,
          originalname: raw.originalname,
          encoding: raw.encoding,
          mimetype: raw.mimetype,
          size: raw.size,
          buffer: Buffer.from(raw.buffer), // Important: convert from plain object to real Buffer
          stream: null, // Not used in your case
          destination: raw.destination,
          filename: raw.filename,
          path: raw.path,
        };

        userEntity.profilePicture =
          await this.minioService.getUploadedFilePath(file);
      }
    }
    const stripeAccountId =
      await this.paymentService.createStripeAccount(userEntity);
    userEntity.stripeAccountId = stripeAccountId;
    userEntity.referalCode = generateAlphaNumericCode(10);
    userEntity.password = hashedPassword;
    userEntity.status = EUserStatus.ACTIVE;

    if (createUserDto.referralCode) {
      const referrer = await this.userService.findByReferralCode(
        createUserDto.referralCode,
      );
      referrer.credits += REFERRAL_CODE_CREDISTS;
      await this.userService.saveUser(referrer);
    }

    if (academicEmailVerfication.isValid) {
      userEntity.academicEmailVerfication = academicEmailVerfication;
    }

    const [savedUser, otp] = await Promise.all([
      this.userService.save(userEntity),
      this.brainService.forget(cacheKey),
    ]);
    const savedUserObject = plainToClass(User, savedUser);
    await this.portfolioService.createPortfolio(savedUserObject);

    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.WELCOME,
      [userEntity.email],
      {
        userName: userEntity.userName,
        otpValidityDuration: RESET_PASSWORD_CACHE.ttl,
        otp: otp,
        verificationUrl: `${this.configService.clientUrl}activate/`,
      },
    );

    return { otp, savedUserObject };
  }

  async verifyAdditionalEmail(
    dto: ActivateAccount,
    loggedInUser: User,
  ): Promise<User | any> {
    await this.verifyOtp(dto.email, dto.otp);
    const additionalEmails = loggedInUser?.secondEmails || [];
    if (!additionalEmails.includes(dto.email)) {
      additionalEmails.push(dto.email);
    }
    loggedInUser.secondEmails = additionalEmails;
    await this.userService.saveUser(loggedInUser);
    return loggedInUser;
  }

  async verifyAdditionalEmailAndReturnSchool(
    dto: ActivateAccount,
  ): Promise<any> {
    await this.verifyOtp(dto.email, dto.otp);
    const school = verifyAcademicEmailByDomain(dto.email);
    if (!school.isValid) {
      this.exceptionHandler.throwBadRequest(_400.INVALID_EMAIL_DOMAIN);
    }
    const match = school.message.match(/^(.+?) verified$/);
    const universityName = match ? match[1] : null;
    return universityName;
  }

  async sendOpt(email: string, isResetPassword: boolean = false) {
    const account: User = await this.userService.findByEmail(email, false);
    const otpId = isResetPassword ? account.id : email;
    const otp = await this.generateOTP(otpId);
    await this.notificationProcessor.sendTemplateEmail(
      isResetPassword
        ? EmailTemplates.VERIFICATION
        : EmailTemplates.VERIFICATION_ADDITIONAL_EMAIL,
      [email],
      {
        userName: account?.userName || email,
        otp: otp,
        otpValidityDuration: 12,
        verificationUrl: `${this.config.clientUrl}auth/reset-password/?email=${email}&verification_code=${otp}`,
      },
    );
    return { otp };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);
    if (user.status === EUserStatus.NOT_VERIFIED) {
      this.exceptionHandler.throwBadRequest(_401.ACCOUNT_NOT_VERIFIED);
    }
    await this.verifyOtp(user.id, dto.otp);
    user.password = await hashPassword(dto.newPassword.toString());
    const updatedUser: User = await this.userService.saveUser(user);
    return plainToClass(User, updatedUser); // Returning the user ignoring excluded field on User
  }
  private async getToken(user: User): Promise<string> {
    return await this.jwt.signAsync(
      { role: user.role, id: user.id },
      {
        expiresIn: this.config.jwtExpiresIn,
        secret: this.config.jwtSecret,
      },
    );
  }
  private generateRandomOTP(): number {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async generateOTP(userId: string): Promise<number> {
    const otp = this.generateRandomOTP();
    const key = `${RESET_PASSWORD_CACHE.name}:${userId}`;

    await this.brainService.memorize(key, otp, RESET_PASSWORD_CACHE.ttl);
    return otp;
  }

  private async verifyOTP(userId: string, otp: number): Promise<boolean> {
    const key = `${RESET_PASSWORD_CACHE.name}:${userId}`;
    const storedOTP = await this.brainService.remindMe<number>(key);
    if (!storedOTP || storedOTP !== otp) {
      return false;
    }
    await this.brainService.forget(key);
    return true;
  }

  private async handleFailedLogin(
    key: string,
    failedAttempts: number,
  ): Promise<void> {
    if (failedAttempts === null) {
      await this.brainService.memorize(key, 1, FAILED_LOGIN_ATTEMPT.ttl);
    } else {
      await this.brainService.memorize(
        key,
        failedAttempts + 1,
        FAILED_LOGIN_ATTEMPT.ttl,
      );
    }
  }

  async generateCustomToken(data: object): Promise<string> {
    return await this.jwt.signAsync(
      { ...data },
      {
        expiresIn: this.config.jwtExpiresIn,
        secret: this.config.jwtSecret,
      },
    );
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }

    const resetToken = await this.generateCustomToken({ userId: user.id });
    await this.brainService.memorize(RESET_PASSWORD_CACHE.name, resetToken);

    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.VERIFICATION,
      [user.email],
      {
        userName: user.firstName,
        verificationUrl: `${this.config.getFrontendUrl()}/reset-password?token=${resetToken}`,
      },
    );

    return { message: 'Password reset email sent' };
  }
  async notifyOnPlatform(data: PlatformQueuePayload) {
    return await this.notificationProcessor.sendPlatformNotification(data);
  }
}
