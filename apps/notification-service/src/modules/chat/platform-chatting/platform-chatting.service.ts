import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGatewayHandler } from '../../../websocket/gateway.socket';
import { ChatService } from '../chat.service';
import { MessageQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { ENotificationStatus } from '@app/common/enums/notification-status.enum';
import { CreateMessageDto } from '../dtos/create-message.dto';

@Injectable()
export class PlatformChattingService {
  private readonly logger = new Logger(PlatformChattingService.name);
  constructor(
    private readonly wsGateway: WebSocketGatewayHandler,
    private readonly chatService: ChatService,
  ) {}

  async broadcastToUsers(queuePayload: MessageQueuePayload) {
    for (const recipient of queuePayload.recipients) {
      await this.handleMessageForRecipient(queuePayload, recipient);
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

  private buildMessageDto(queuePayload: MessageQueuePayload): CreateMessageDto {
    return {
      content: queuePayload.createMessageDto.content,
      sharedFiles: queuePayload.createMessageDto.sharedFiles,
      urls: queuePayload.createMessageDto.urls,
    };
  }

  private async handleMessageForRecipient(
    queuePayload: MessageQueuePayload,
    recipient: string,
  ) {
    try {
      const server = this.getWebSocketServer();

      const messageDto = this.buildMessageDto(queuePayload);

      const deserializedFiles = queuePayload.files.map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: Buffer.from(file.buffer, 'base64'), // Convert base64 string back to buffer
        destination: '',
        filename: file.originalname,
        path: '',
        stream: null as any,
      }));

      const message = await this.chatService.createMessage(
        queuePayload.sender,
        queuePayload.receiver,
        messageDto,
        deserializedFiles,
      );

      server.to(`user_${recipient}`).emit('message', {
        ...queuePayload,
        id: message.id,
        createdAt: new Date(),
        notificationStatus: ENotificationStatus.DELIVERED,
      });

      this.logger.log(`Message sent to room: user_${recipient}`);
    } catch (error) {
      this.logger.error(`Failed to send message to user_${recipient}:`, error);
      throw error;
    }
  }
}
