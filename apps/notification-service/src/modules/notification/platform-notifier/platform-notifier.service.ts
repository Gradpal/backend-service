import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGatewayHandler } from '../../../websocket/gateway.socket';
import {
  PlatformQueuePayload,
  Recipient,
} from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { CreateNotificationRegistryDto } from '../dto/create-notification-registry.dto';
import { ENotificationType } from '@app/common/enums/notification-type.enum';
import { NotificationService } from '../notification.service';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';

@Injectable()
@Injectable()
export class PlatformNotifierService {
  private readonly logger = new Logger(PlatformNotifierService.name);

  constructor(
    private readonly wsGateway: WebSocketGatewayHandler,
    private readonly notificationService: NotificationService,
  ) {}

  async broadcastToUsers(queuePayload: PlatformQueuePayload) {
    for (const recipient of queuePayload.recipients) {
      await this.handleNotificationForRecipient(queuePayload, recipient);
    }

    return true;
  }

  private getWebSocketServer() {
    const server = this.wsGateway.getServer();
    if (!server) {
      this.logger.error('WebSocket server not initialized');
      throw new Error('WebSocket server not available');
    }
    return server;
  }

  private async handleNotificationForRecipient(
    queuePayload: PlatformQueuePayload,
    recipient: Recipient,
  ) {
    try {
      const server = this.getWebSocketServer();

      const notificationDto = this.buildNotificationDto(
        queuePayload,
        recipient,
      );

      await this.notificationService.create(notificationDto);

      server.to(`user_${recipient.userId}`).emit('notification', queuePayload);

      this.logger.log(`Notification sent to room: user_${recipient.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user_${recipient.userId}:`,
        error,
      );
    }
  }

  private buildNotificationDto(
    queuePayload: PlatformQueuePayload,
    recipient: Recipient,
  ): CreateNotificationRegistryDto {
    return {
      type: ENotificationType.PLATFORM,
      notificationStatus: ENotificationStatus.DELIVERED,
      receiverUserId: recipient.userId,
      subject: queuePayload.subject,
      content: '',
      messageType: queuePayload.messageType,
      metadata: queuePayload.metadata || {},
    };
  }
}
