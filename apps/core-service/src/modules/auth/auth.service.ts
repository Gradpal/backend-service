import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO, LoginResDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
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
import {
  FAILED_LOGIN_ATTEMPT,
  RESET_PASSWORD_CACHE,
} from '@core-service/common/constants/brain.constants';
import { MAX_FAILED_ATTEMPTS } from '@core-service/common/constants/all.constants';
import { hashPassword } from '@core-service/common/helpers/all.helpers';
import { EUserRole } from '../user/enums/user-role.enum';
import { StudentService } from '../student/student.service';
import { TutorService } from '../tutor/tutor.service';
import { CreateTutorDto } from '../tutor/dto/create-tutor.dto';
import { RegisterDTO } from './dto/register.dto';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly studentService: StudentService,
    private readonly tutorService: TutorService,
    private readonly config: CoreServiceConfigService,
    private readonly jwt: JwtService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly brainService: BrainService,
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
    const failedAttempts = await this.brainService.remindMe<number>(key);

    if (failedAttempts !== null && failedAttempts >= MAX_FAILED_ATTEMPTS) {
      this.exceptionHandler.throwUnauthorized(_401.ACCOUNT_LOCKED);
    }

    // const passwordsMatch = await bcrypt.compare(
    //   dto.password.toString(),
    //   user.password.toString(),
    // );

    // if (!passwordsMatch) {
    //   // await this.handleFailedLogin(key, failedAttempts);
    //   throw this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    // }

    const token = await this.getToken(user);
    user = plainToClass(User, user);
    return { token, user };
  }
  async verifyOtp(id: string, otp: number) {
    const isOtpValid = await this.verifyOTP(id, otp);
    if (!isOtpValid) this.exceptionHandler.throwBadRequest(_400.INVALID_OTP);
  }
  async verifyAccount(dto: ActivateAccount): Promise<User> {
    const account: User = await this.userService.findByEmail(dto.email);
    await this.verifyOtp(account.id, dto.otp);
    account.status = EUserStatus.ACTIVE;

    // Create Stripe account for the user
    const stripeAccountId =
      await this.paymentService.createStripeAccount(account);
    account.stripeAccountId = stripeAccountId;

    if (account.role === EUserRole.STUDENT) {
      await this.studentService.saveStudent(account);
    }

    if (account.role === EUserRole.TUTOR) {
      const tutorDto: CreateTutorDto = {
        profileId: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        userName: account.userName,
        phoneNumber: account.phone_number,
        countryOfResidence: account.country_of_residence,
        country: account.country_of_residence,
        refererId: account.referer?.id || '',
        citizenship: account.country_of_residence,
        location: account.country_of_residence,
        referralCode: account.referalCode,
        password: account.password,
        role: account.role,
        profilePicture: null,
      };
      await this.tutorService.create(tutorDto);
    }

    return await this.userService.saveUser(account);
  }
  async sendOpt(email: string) {
    const account: User = await this.userService.findByEmail(email);
    const otp = await this.generateOTP(account.id);
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.VERIFICATION,
      [account.email],
      {
        userName: account.userName,
        otp: `${otp}`,
        otpValidityDuration: 12,
        verificationUrl: `${this.config.clientUrl}auth/reset-password/?email=${account.email}&verification_code=${otp}`,
      },
    );
    console.log('otp', otp);
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

  //  generating OTP
  private async generateOTP(userId: string): Promise<number> {
    const otp = this.generateRandomOTP();
    const key = `${RESET_PASSWORD_CACHE.name}:${userId}`;

    await this.brainService.memorize(key, otp, RESET_PASSWORD_CACHE.ttl);
    return otp;
  }

  //  verifying OTP
  private async verifyOTP(userId: string, otp: number): Promise<boolean> {
    const key = `${RESET_PASSWORD_CACHE.name}:${userId}`;
    const storedOTP = await this.brainService.remindMe<number>(key);

    if (!storedOTP || storedOTP !== otp) {
      return false;
    }
    // Clean up after successful verification
    await this.brainService.forget(key);
    return true;
  }

  private async handleFailedLogin(
    key: string,
    failedAttempts: number,
  ): Promise<void> {
    // Increment the failed login attempts or initialize it if not present
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

  async register(dto: RegisterDTO): Promise<User> {
    if (await this.userService.existByEmail(dto.email)) {
      this.exceptionHandler.throwBadRequest(_400.INVALID_USER_ID);
    }

    const hashedPassword = await hashPassword(dto.password);
    const createUserDto: CreateUserDTO = {
      ...dto,
      password: hashedPassword,
      userName: dto.email.split('@')[0],
      phoneNumber: '+1234567890', // Default phone number
      countryOfResidence: 'US', // Default country
    };

    const user = await this.userService.create(createUserDto);

    const otp = await this.generateOTP(user.id);
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.VERIFICATION,
      [user.email],
      {
        userName: user.firstName,
        verificationUrl: `${this.config.getFrontendUrl()}/verify-email?otp=${otp}`,
      },
    );

    return user;
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
}
