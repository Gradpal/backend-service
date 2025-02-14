import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { ClientGrpc } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _404, _409 } from '@app/common/constants/errors-constants';
import { INTEGRATION_GRPC_PACKAGE } from '@app/common/constants/services-constants';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EUserStatus } from './enums/user-status.enum';
import { EUserRole } from './enums/user-role.enum';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { CreateAdminDTO } from './dto/create-admin.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { plainToClass } from 'class-transformer';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { USER_BY_ID_CACHE } from '@core-service/common/constants/brain.constants';
import { BrainService } from '@app/common/brain/brain.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { lastValueFrom, Observable } from 'rxjs';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { ConfirmUserProfileDto } from './dto/confirm-profile.dto';
import { hashPassword } from '@core-service/common/helpers/all.helpers';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UserService {
 
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly configService: CoreServiceConfigService,
    private readonly exceptionHandler: ExceptionHandler,
    @Inject(INTEGRATION_GRPC_PACKAGE) private readonly client: ClientGrpc,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
  ) {
  }
  // sample method that onboard a student
  // this method will get the student reg number, and get the student details from the student service
  // the parameters can be a DTO, but for simplicity, we are using a string
  

  // This is the service for confirming the user information.
  async confirmUserProfile(confirmProfileDto: ConfirmUserProfileDto) {
    const user = await this.findOne(confirmProfileDto.userId);
    user.password = await hashPassword(confirmProfileDto.password);
    user.status = EUserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async create(createUserDto: CreateUserDTO) {
    if (await this.existByEmail(createUserDto.email)) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    const userEntity: User = this.userRepository.create(createUserDto);
    userEntity.password = await bcrypt.hash(
      this.configService.defaultPassword,
      10,
    );
    const isUserAdmin = createUserDto.role === EUserRole.COMPANY_ADMIN;
    const isCollegeAdmin = createUserDto.role === EUserRole.COLLEGE_ADMIN;

    const [savedUser] = await Promise.all([
      this.userRepository.save(userEntity),
      this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.WELCOME,
        [userEntity.email],
        {
          userName: userEntity.firstName,
          isNewUser: true,
          dashboardUrl: `${this.configService.clientUrl}activate/`,
        },
      ),
    ]);
    return plainToClass(User, savedUser);
  }

  async createAdmin(createUserDto: CreateAdminDTO) {
    const userExists: boolean = await this.existByEmail(createUserDto.email);
    if (userExists)
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    let user: User = this.userRepository.create(createUserDto);
    user.role = EUserRole.SUPER_ADMIN;
    user.password = await bcrypt.hash(user.password, 10);
    user = await this.userRepository.save(user);
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.WELCOME,
      [user.email],
      {
        userName: user.firstName,
        isNewUser: true,
        dashboardUrl: `${this.configService.clientUrl}activate/`,
      },
    );
    return user;
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

  // This method updates an existing user
  // It's needed by external services just to update the user
  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
  async findByEmail(email: string) {
    if (!(await this.existByEmail(email)))
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    return user;
  }

  //TODO: this is a sample method to show how to cache a query result and it should not be used in production

  async findOneCached(id: string) {
    const cacheKey = `${USER_BY_ID_CACHE.name}:${id}`;
    // check if the user is already cached
    const cachedUser = await this.brainService.remindMe<User>(cacheKey);
    if (cachedUser) return cachedUser;

    // if not cached, get the user from the database and cache it
    const user = await this.userRepository.findOne({ where: { id } });

    await this.brainService.memorize<User>(
      cacheKey,
      user,
      USER_BY_ID_CACHE.ttl,
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
    user.firstName = updateSettingsDto.firstName;
    user.lastName = updateSettingsDto.lastName;
    user.password = await hashPassword(updateSettingsDto.password);
    return await this.userRepository.save(user);
  }

  async delete(id: string) {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0)
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
  }

  // TO DO: Remove this endpoint after engineer in need has tested
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
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return users;
  }

  async findAllLectures() {
    const users = await this.userRepository.find({
      where: {
        role: EUserRole.LECTURE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return users;
  }

  async findAllIncubationCenterStaff() {
    const users = await this.userRepository.find({
      where: {
        role: EUserRole.INCUBATION_CENTER_STAFF,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return users;
  }
}
