import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationRegistryDto } from './dto/create-notification-registry.dto';
import { Notification } from './entities/notification-registry.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRegistryRepository: Repository<Notification>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async create(createNotificationDto: CreateNotificationRegistryDto) {
    try {
      return await this.notificationRegistryRepository.save(
        createNotificationDto,
      );
    } catch (error) {
      this.exceptionHandler.throwInternalServerError(error);
    }
  }

  async findAll() {
    return await this.notificationRegistryRepository.find();
  }

  async findById(id: string) {
    const notification = await this.notificationRegistryRepository.findOne({
      where: { id },
    });
    if (!notification)
      this.exceptionHandler.throwNotFound(_404.NOTIFICATION_REGISTRY_NOT_FOUND);
    return notification;
  }

  async findByStatus(status: ENotificationStatus) {
    return await this.notificationRegistryRepository.find({
      where: { notificationStatus: status },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.findById(id); 
    notification.notificationStatus = ENotificationStatus.READ;
    return await this.notificationRegistryRepository.save(notification);
  }

  async getUserNotificationsByStatus(
    userId: string,
    status: ENotificationStatus,
  ) {
    return await this.notificationRegistryRepository.find({
      where: {
        receiverUserId: userId,
        notificationStatus: status,
      },
    });
  }

  async getUserNotificationsByStatusPaginated(
    userId: string,
    status: ENotificationStatus,
    page: number,
    limit: number,
    sortDirection: 'asc' | 'desc',
  ) {
    return await this.notificationRegistryRepository.find({
      where: {
        receiverUserId: userId,
        notificationStatus: status,
      },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        updatedAt: sortDirection === 'desc' ? 'DESC' : 'ASC',
      },
    });
  }

  async delete(id: string) {
    const notification = await this.findById(id);
    return await this.notificationRegistryRepository.remove(notification);
  }
}
