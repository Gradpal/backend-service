import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EUserStatus } from './enums/user-status.enum';
import { EUserRole } from './enums/user-role.enum';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { CreateAdminDTO } from './dto/create-admin.dto';
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
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { USER_BY_EMAIL_CACHE } from '@core-service/common/constants/brain.constants';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
    private readonly configService: CoreServiceConfigService,
  ) {}

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
    console.log('Email sent');
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
      user.profilePicture = await this.minioService.uploadFile(
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
    nameKey: string,
    role: EUserRole,
  ) {
    const query = this.userRepository.createQueryBuilder('user');
    const searchKey = nameKey || '';

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
    const user = await this.userRepository.findOne({ where: { id } });
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
    if (await this.existByEmail(updateSettingsDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    user.email = updateSettingsDto.email;
    user.password = await hashPassword(updateSettingsDto.password);
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
}
