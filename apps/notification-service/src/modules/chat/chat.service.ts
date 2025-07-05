import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { EMessageStatus } from './enums/message-status.enum';
import { EConversationStatus } from './enums/conversation-status.enum';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { DB_ROOT_NAMES } from '../../common/constants/typeorm-config.constant';
import { CORE_GRPC_PACKAGE } from '@app/common/constants/services-constants';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { GrpcServices } from '@core-service/common/constants/grpc.constants';
import { MinioClientService } from '@core-service/modules/minio-client/minio-client.service';
import { lastValueFrom, Observable } from 'rxjs';
import {
  PATTERNS,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

@Injectable()
export class ChatService {
  private minioClientService: MinioClientService;
  constructor(
    @InjectRepository(Conversation, DB_ROOT_NAMES.CHAT)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message, DB_ROOT_NAMES.CHAT)
    private readonly messageRepository: Repository<Message>,
    @Inject(CORE_GRPC_PACKAGE) private client: ClientGrpc,
    @Inject(QUEUE_HANDLERS.MESSAGE) private messageClient: ClientProxy,
    private readonly exceptionHandler: ExceptionHandler,
  ) {
    this.minioClientService = this.client.getService<MinioClientService>(
      GrpcServices.MINIO_CLIENT_SERVICE,
    );
  }

  async createConversation(createConversationDto: CreateConversationDto) {
    const conversation = this.conversationRepository.create(
      createConversationDto,
    );
    return this.conversationRepository.save(conversation);
  }

  async sendMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
    files: Express.Multer.File[],
  ) {
    try {
      // Get conversation to determine recipients
      const conversation = await this.getConversation(conversationId);

      let senderId: string;
      let receiverId: string;
      let recipients: { userId: string }[];

      if (!conversation) {
        // Logger.warn(
        //   `Conversation ${conversationId} not found, using fallback values for testing`,
        // );
        // For testing purposes, use fallback values
        senderId = '123';
        receiverId = '456';
        recipients = [{ userId: senderId }, { userId: receiverId }];
      } else {
        // Logger.log(`Found conversation: ${JSON.stringify(conversation)}`);
        senderId = conversation.senderId;
        receiverId = conversation.receiverId;
        recipients = [
          { userId: conversation.senderId },
          { userId: conversation.receiverId },
        ];
      }

      // Convert files to a serializable format for RabbitMQ
      const serializedFiles = files.map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer.toString('base64'), // Convert buffer to base64 string
      }));

      const payload = {
        conversationId,
        createMessageDto,
        receiverUserId: receiverId,
        senderUserId: senderId,
        files: serializedFiles,
        recipients,
      };

      // Logger.log(
      //   `Emitting message with payload: ${JSON.stringify(payload, null, 2)}`,
      // );

      return this.messageClient.emit(PATTERNS.SEND_MESSAGE, payload);
    } catch (error) {
      Logger.error('Error sending platform message:', error);
      this.exceptionHandler.throwInternalServerError(error);
    }
  }

  async createMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
    files: Express.Multer.File[],
  ) {
    try {
      Logger.log(`Creating message for conversation: ${conversationId}`);

      let conversation = await this.getConversation(conversationId);
      if (!conversation) {
        Logger.warn(
          `Conversation ${conversationId} not found, creating a dummy conversation for testing`,
        );
        // Create a dummy conversation for testing
        conversation = this.conversationRepository.create({
          senderId: '123',
          receiverId: '456',
          status: EConversationStatus.ACTIVE,
        });
        await this.conversationRepository.save(conversation);
        Logger.log(`Created dummy conversation with ID: ${conversation.id}`);
      }

      Logger.log(`Processing ${files.length} files for upload`);

      let sharedFiles = [];
      if (files.length > 0) {
        const sharedFilesObservables =
          await this.minioClientService.uploadMessageAttachments({ files });

        const sharedFilesResult = await lastValueFrom(
          sharedFilesObservables as unknown as Observable<any>,
        );

        sharedFiles = sharedFilesResult.result || [];
        Logger.log(`Uploaded ${sharedFiles.length} files successfully`);
      }

      const message = this.messageRepository.create({
        ...createMessageDto,
        conversation,
        sharedFiles,
      });

      const savedMessage = await this.messageRepository.save(message);
      Logger.log(`Message created successfully with ID: ${savedMessage.id}`);

      return savedMessage;
    } catch (error) {
      Logger.error('Error creating message:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, updateMessageDto: CreateMessageDto) {
    return this.messageRepository.update(messageId, updateMessageDto);
  }

  async getConversations(userId: string) {
    return this.conversationRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });
  }

  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
    });
  }

  async getConversation(conversationId: string) {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
    });
  }

  async getMessage(messageId: string) {
    return this.messageRepository.findOne({
      where: { id: messageId },
    });
  }

  async updateConversation(
    conversationId: string,
    updateConversationDto: CreateConversationDto,
  ) {
    return this.conversationRepository.update(
      conversationId,
      updateConversationDto,
    );
  }

  async deleteConversation(conversationId: string) {
    return this.conversationRepository.delete(conversationId);
  }

  async deleteMessage(messageId: string) {
    return this.messageRepository.delete(messageId);
  }

  async markMessageAsRead(messageId: string) {
    return this.messageRepository.update(messageId, {
      status: EMessageStatus.READ,
    });
  }
  async markAllMessagesAsRead(conversationId: string) {
    return this.messageRepository.update(
      { conversation: { id: conversationId } },
      { status: EMessageStatus.READ },
    );
  }
  async archiveConversation(conversationId: string) {
    return this.conversationRepository.update(conversationId, {
      status: EConversationStatus.ACHIEVED,
    });
  }
  async unarchiveConversation(conversationId: string) {
    return this.conversationRepository.update(conversationId, {
      status: EConversationStatus.ACTIVE,
    });
  }
  async blockConversation(conversationId: string) {
    return this.conversationRepository.update(conversationId, {
      status: EConversationStatus.BLOCKED,
    });
  }
  async unblockConversation(conversationId: string) {
    return this.conversationRepository.update(conversationId, {
      status: EConversationStatus.ACTIVE,
    });
  }
}
