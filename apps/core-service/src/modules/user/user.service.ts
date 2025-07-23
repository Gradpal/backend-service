import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _403, _404, _409 } from '@app/common/constants/errors-constants';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EUserStatus } from './enums/user-status.enum';
import { EUserRole } from './enums/user-role.enum';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import {
  CreateAdminDTO,
  CreateNationalPortalAdminDTO,
} from './dto/create-admin.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { plainToClass } from 'class-transformer';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { BrainService } from '@app/common/brain/brain.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ConfirmUserProfileDto } from './dto/confirm-profile.dto';
import {
  generateAlphaNumericCode,
  hashPassword,
} from '@core-service/common/helpers/all.helpers';
import {
  DeactivateUserDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import {
  USER_BY_EMAIL_CACHE,
  USER_INVITATION_CACHE,
} from '@core-service/common/constants/brain.constants';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { Booking } from '../booking/entities/booking.entity';
import { PortalService } from '@core-service/portal/portal.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { LoadChatUserByIdRequest } from './dto/grpc/load-chat-user-by-id.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
    private readonly configService: CoreServiceConfigService,
    @Inject(forwardRef(() => PortalService))
    private readonly nationalPortalService: PortalService,
  ) {}

  public getUserRepository() {
    return this.userRepository;
  }

  async confirmUserProfile(confirmProfileDto: ConfirmUserProfileDto) {
    const user = await this.findOne(confirmProfileDto.userId);
    user.password = await hashPassword(confirmProfileDto.password);
    user.status = EUserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async create(
    createUserDto: CreateUserDTO,
    profilePicture?: Express.Multer.File,
  ) {
    if (await this.existByEmail(createUserDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    const existingUserWithPhone = await this.userRepository.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });
    if (existingUserWithPhone) {
      this.exceptionHandler.throwConflict(_409.PHONE_NUMBER_ALREADY_EXISTS);
    }

    const cacheKey = this.brainService.getCacheKey(createUserDto.email);

    const otp = await this.brainService.generateOTP(createUserDto.email);

    await this.brainService.memorize<CreateUserDTO>(
      cacheKey,
      { ...createUserDto, profilePicture: profilePicture },
      USER_BY_EMAIL_CACHE.ttl,
    );

    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.USER_ONBOARDING_VERIFICATION,
      [createUserDto.email],
      {
        userName: createUserDto?.firstName
          ? createUserDto?.firstName
          : createUserDto?.email,
        otp: otp,
        otpValidityDuration: 12,
        verificationUrl: `${this.configService.clientUrl}user/onboarding/verify-email/?otp=${otp}&email=${createUserDto.email}`,
      },
    );
  }

  async getUserEntityFromDto(createUserDto: CreateUserDTO) {
    if (await this.existByEmail(createUserDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    const userEntity = this.userRepository.create({
      ...createUserDto,
      profilePicture: '',
    });
    return userEntity;
  }

  async createAdmin(createUserDto: CreateAdminDTO) {
    if (await this.existByEmail(createUserDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }

    const { profilePicture: _, ...adminDataWithoutFiles } = createUserDto;
    let user: User = this.userRepository.create(adminDataWithoutFiles);

    if (createUserDto.profilePicture) {
      user.profilePicture = await this.minioService.getUploadedFilePath(
        createUserDto.profilePicture,
      );
    }

    user.password = await bcrypt.hash(generateAlphaNumericCode(8), 10);
    user.referalCode = generateAlphaNumericCode(10);
    user = await this.userRepository.save(user);

    return plainToClass(User, user);
  }

  async findAll(
    page: number,
    limit: number,
    status: EUserStatus,
    searchKeyword: string,
    role: EUserRole,
  ) {
    const query = this.userRepository.createQueryBuilder('user');
    const searchKey = searchKeyword || '';

    if (status) {
      query.andWhere('user.status = :status', { status });
    }
    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query.andWhere(
      '(user.firstName ILIKE :keyword OR user.lastName ILIKE :keyword OR user.email ILIKE :keyword)',
      {
        keyword: `%${searchKey}%`,
      },
    );

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    if (!(await this.existByEmail(email)))
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByReferralCode(code: string) {
    const user = await this.userRepository.findOne({
      where: { referalCode: code },
    });
    if (!user)
      this.exceptionHandler.throwNotFound(
        _404.USER_WITH_REFERAL_CODE_NOT_FOUND,
      );
    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'portfolio',
        'portfolio.subjects',
        'portfolio.subjectTiers',
        'portfolio.sessionPackageOfferings',
        'timeSlots',
        'timeSlots.daySchedule',
        'timeSlots.daySchedule.weeklyAvailability',
      ],
    });
    if (!user) this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    return user;
  }

  async findOneCached(id: string) {
    const cacheKey = `${USER_BY_EMAIL_CACHE.name}:${id}`;
    const cachedUser = await this.brainService.remindMe<User>(cacheKey);
    if (cachedUser) return cachedUser;
    const user = await this.userRepository.findOne({ where: { id } });

    await this.brainService.memorize<User>(
      cacheKey,
      user,
      USER_BY_EMAIL_CACHE.ttl,
    );

    return user;
  }

  async existByEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }

  async update(id: string, updateUserDto: Partial<CreateUserDTO>) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updateSettings(
    user: User,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<User> {
    const { email, password, timezone, displayTimezoneFormat, ...restFields } =
      updateSettingsDto;

    if (email && email !== user.email) {
      const emailExists = await this.existByEmail(email);
      if (emailExists) {
        this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
      }
      user.email = email;
    }

    if (password) {
      user.password = await hashPassword(password);
    }

    Object.entries(restFields).forEach(([key, value]) => {
      if (value !== undefined && key in user) {
        (user as User)[key] = value;
      }
    });

    return await this.userRepository.save(user);
  }

  async delete(id: string) {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0)
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
  }

  async notifyOnPlatform(data: PlatformQueuePayload) {
    return await this.notificationProcessor.sendPlatformNotification(data);
  }

  // Example to upload a file with Minio
  async uploadFileExample(file: Express.Multer.File) {
    return this.minioService.uploadFile(file);
  }

  async findAllStudents() {
    const users = await this.userRepository.find({
      where: {
        role: EUserRole.STUDENT,
      },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return users;
  }

  async findAllTutors() {
    const users = await this.userRepository.find({
      where: {
        role: EUserRole.TUTOR,
      },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return users;
  }

  async save(user: User) {
    return await this.userRepository.save(user);
  }

  async acceptTermsAndConditions(user: User) {
    user.termsAndConditionsAccepted = true;
    return await this.userRepository.save(user);
  }
  async deactivateUser(userId: string, deactivateUserDto: DeactivateUserDto) {
    const user = await this.findOne(userId);
    console.log(user);
    if (user.status === EUserStatus.INACTIVE) {
      this.exceptionHandler.throwConflict(_400.USER_ALREADY_DEACTIVATED);
    }
    user.status = EUserStatus.INACTIVE;
    user.deactivation = deactivateUserDto;
    return await this.userRepository.save(user);
  }
  async activateUser(userId: string) {
    const user = await this.findOne(userId);
    if (user.status === EUserStatus.ACTIVE) {
      this.exceptionHandler.throwConflict(_400.USER_ALREADY_ACTIVATED);
    }
    user.status = EUserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }
  async createNationalPortalAdmin(
    createNationalPortalAdminDto: CreateNationalPortalAdminDTO,
  ) {
    const portal = await this.nationalPortalService.getNationalPortalById(
      createNationalPortalAdminDto.countryId,
    );
    const user = await this.userRepository.create({
      email: createNationalPortalAdminDto.email,
      role: EUserRole.NATIONAL_PORTAL_ADMIN,
      userName: createNationalPortalAdminDto.email,
      password: await hashPassword(createNationalPortalAdminDto.email),
    });
    portal.admin = user;
    const [updatedPortal, updatedUser] = await Promise.all([
      this.userRepository.save(user),
      this.nationalPortalService.getNationalPortalRepository().save(portal),
    ]);
    return updatedUser;
  }
  // Parent Invitation

  async inviteParentByEmail(email: string, student: User) {
    const key = `${USER_INVITATION_CACHE.name}:${email}`;
    const invitationId = generateAlphaNumericCode(10);
    await this.brainService.memorize(
      key,
      invitationId,
      USER_INVITATION_CACHE.ttl,
    );
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.PARENT_INVITATION,
      [email],
      {
        studentName: `${student.firstName} ${student.lastName}`,
        nationalPortal: 'Rwanda',
        nationalPortalAdminContact: 'support@gradpal.io',
        invitationUrl: `${this.configService.clientUrl}user/onboarding/verify-email/?studentId=${student.id}&otp=${invitationId}&email=${email}`,
      },
    );
  }

  async acceptParentInvitation(
    email: string,
    acceptInvitationDto: AcceptInvitationDto,
  ) {
    const key = `${USER_INVITATION_CACHE.name}:${email}`;
    const [cachedInvitationId, student] = await Promise.all([
      this.brainService.remindMe<string>(key),
      this.findOne(acceptInvitationDto.studentId),
    ]);
    if (!student) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    if (!cachedInvitationId) {
      this.exceptionHandler.throwNotFound(_403.PARENT_INVITATION_EXPIRED);
    }
    if (cachedInvitationId !== acceptInvitationDto.invitationId) {
      this.exceptionHandler.throwNotFound(_403.PARENT_INVITATION_EXPIRED);
    }
    let parent = this.userRepository.create({
      email: acceptInvitationDto.email,
      role: EUserRole.PARENT,
      userName: acceptInvitationDto.email,
      firstName: acceptInvitationDto.firstName,
      lastName: acceptInvitationDto.lastName,
      password: await hashPassword(acceptInvitationDto.password),
    });
    parent = await this.userRepository.save(parent);
    student.parent = parent;
    await Promise.all([
      this.userRepository.save(student),
      this.brainService.forget(key),
    ]);
    return parent;
  }

  async getChildren(parent: User) {
    return await this.userRepository.find({
      where: {
        parent: {
          id: parent.id,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        credits: true,
        role: true,
        portfolio: {
          id: true,
        },
      },
      relations: ['portfolio'],
    });
  }

  ///////////////////////  ///////////////////////  ///////////////////////  ///////////////////////
  async createRandomDummyUsers() {
    const dummyUsers = [
      {
        email: 'student@gradpal.io',
        role: EUserRole.STUDENT,
        firstName: 'Student',
        lastName: '1',
        userName: 'student1',
        password: await hashPassword('VAVAvalens2003@!'),
        profilePicture: '',
        referalCode: generateAlphaNumericCode(10),
        termsAndConditionsAccepted: false,
        phoneNumber: '+23481333633903',
      },
      {
        email: 'tutor@gradpal.io',
        role: EUserRole.TUTOR,
        firstName: 'Tutor',
        lastName: '1',
        userName: 'student2',
        password: await hashPassword('VAVAvalens2003@!'),
        profilePicture: '',
        referalCode: generateAlphaNumericCode(10),
        termsAndConditionsAccepted: false,
        phoneNumber: '+2348133353933',
      },
      {
        email: 'admin@gradpal.io',
        role: EUserRole.SUPER_ADMIN,
        firstName: 'Admin',
        lastName: '1',
        userName: 'student3',
        password: await hashPassword('VAVAvalens2003@!'),
        profilePicture: '',
        referalCode: generateAlphaNumericCode(10),
        termsAndConditionsAccepted: false,
        phoneNumber: '+2348133343313',
      },
      {
        email: 'nationalportaladmin@gradpal.io',
        role: EUserRole.NATIONAL_PORTAL_ADMIN,
        firstName: 'National Portal Admin',
        password: await hashPassword('VAVAvalens2003@!'),
        lastName: '1',
        userName: 'national-portal-admin',
        phoneNumber: '+2348133323333',
      },
      {
        email: 'parent@gradpal.io',
        role: EUserRole.PARENT,
        firstName: 'Parent',
        lastName: '1',
        userName: 'parent1',
        password: await hashPassword('VAVAvalens2003@!'),
        profilePicture: '',
        referalCode: generateAlphaNumericCode(10),
        termsAndConditionsAccepted: false,
        phoneNumber: '+2348133333333',
      },
    ];
    const users = await Promise.all(
      dummyUsers.map(async (user) => {
        if (await this.existByEmail(user.email)) {
          return;
        }
        let userEntity = this.userRepository.create(user);
        userEntity = await this.userRepository.save(userEntity);

        if (user.role == EUserRole.STUDENT || user.role == EUserRole.TUTOR) {
          let portfolio = await this.portfolioService
            .getPortfolioRepository()
            .create({
              user: userEntity,
              subjects: [],
              subjectTiers: [],
              academicSubjects: [],
              academicTranscripts: [],
              degreeCertificates: [],
              sessionType: [],
              sessionPackageOfferings: [],
              sessionLengths: [],
              hourlyRate: 0,
              totalStudents: 0,
            });
          portfolio = await this.portfolioService.save(portfolio);
          userEntity.portfolio = portfolio;
          await this.userRepository.save(userEntity);
        }
      }),
    );
    return users;
  }

  async testUploadFile(file: Express.Multer.File) {
    return this.minioService.uploadFile(file);
  }

  async loadChartUserById({ id }: LoadChatUserByIdRequest) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        status: true,
      },
    });
    return { result: user ? [user] : [] };
  }
}
