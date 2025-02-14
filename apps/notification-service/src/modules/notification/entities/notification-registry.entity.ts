import { BaseEntity } from '@app/common/database/base.entity';
import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { ENotificationType } from '@app/common/enums/notification-type.enum';
import { Column, Entity } from 'typeorm';

@Entity('notification')
export class Notification extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ENotificationType,
    name: 'notification_type',
  })
  type: ENotificationType;

  @Column({
    type: 'enum',
    enum: ENotificationStatus,
    name: 'notification_status',
    default: ENotificationStatus.DELIVERED,
  })
  notificationStatus: ENotificationStatus;

  @Column({
    type: 'text',
    name: 'receiver_user_id',
    nullable: true,
  })
  receiverUserId: string;

  @Column({
    type: 'text',
  })
  subject: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: ENotificationMessageType,
    name: 'message_type',
    nullable: true,
  })
  messageType: ENotificationMessageType;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;
}
