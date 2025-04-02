import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _404, _409 } from '@app/common/constants/errors-constants';
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
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { ConfirmUserProfileDto } from './dto/confirm-profile.dto';
import {
  generateAlphaNumericCode,
  hashPassword,
} from '@core-service/common/helpers/all.helpers';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { USER_BY_EMAIL_CACHE } from '@core-service/common/constants/brain.constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly configService: CoreServiceConfigService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
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

    // Create user without file fields first
    const { profilePicture: _, ...userDataWithoutFiles } = createUserDto;
    const userEntity: User = this.userRepository.create(userDataWithoutFiles);

    // Handle profile picture upload
    if (profilePicture) {
      userEntity.profilePicture =
        await this.minioService.uploadFile(profilePicture);
    }

    userEntity.password = await bcrypt.hash(generateAlphaNumericCode(8), 10);
    userEntity.referalCode = generateAlphaNumericCode(10);

    const [savedUser] = await Promise.all([
      this.userRepository.save(userEntity),
      this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.WELCOME,
        [userEntity.email],
        {
          userName: userEntity.userName,
          otpValidityDuration: 3,
          otp: '34',
          verificationUrl: `${this.configService.clientUrl}activate/`,
        },
      ),
    ]);

    return plainToClass(User, savedUser);
  }

  async createAdmin(createUserDto: CreateAdminDTO) {
    if (await this.existByEmail(createUserDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }

    // Create admin without file fields first
    const { profilePicture: _, ...adminDataWithoutFiles } = createUserDto;
    let user: User = this.userRepository.create(adminDataWithoutFiles);

    // Handle profile picture upload if provided
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
    query
      .andWhere('user.role = :role', { role })
      .andWhere(
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

  async findByReferalCode(code: string) {
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
}
