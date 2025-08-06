import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { ENotificationType } from '@app/common/enums/notification-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateNotificationRegistryDto {
  @IsEnum(ENotificationType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of notification',
    enum: ENotificationType,
  })
  type: ENotificationType;

  @IsEnum(ENotificationStatus)
  @ApiProperty({
    description: 'The status of the notification',
    enum: ENotificationStatus,
    default: ENotificationStatus.DELIVERED,
  })
  notificationStatus?: ENotificationStatus = ENotificationStatus.DELIVERED;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The ID of the user receiving the notification',
    nullable: true,
  })
  receiverUserId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The subject of the notification',
  })
  subject: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The content of the notification',
    nullable: true,
  })
  content?: string;

  @IsEnum(ENotificationMessageType)
  @IsOptional()
  @ApiProperty({
    description: 'The type of the message in the notification',
    enum: ENotificationMessageType,
    nullable: true,
  })
  messageType?: ENotificationMessageType;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional metadata for the notification',
    type: Object,
    nullable: true,
  })
  metadata?: Record<string, object | string | number>;
}
