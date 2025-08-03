import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { EMessageStatus } from './enums/message-status.enum';
import { EConversationStatus } from './enums/conversation-status.enum';
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
import { UserService } from '@core-service/modules/user/user.service';
import { MessageOwner } from './dtos/message-owner.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { CreateConversationRequest } from './dtos/create-conversation.dto';

@Injectable()
export class ChatService {
  private minioClientService: MinioClientService;
  private coreUserService: UserService;
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
    this.coreUserService = this.client.getService<UserService>(
      GrpcServices.USER_SERVICE,
    );
  }

  async sendMessage(
    createMessageDto: CreateMessageDto,
    receiverId: string,
    messageOwner: MessageOwner,
    files: Express.Multer.File[],
  ) {
    try {
      const [receiverObservable, senderObservable] = await Promise.all([
        this.coreUserService.loadChartUserById({
          id: receiverId,
        }),
        this.coreUserService.loadChartUserById({
          id: messageOwner.id,
        }),
      ]);

      let conversation = await this.getConversationBySenderAndReceiver(
        messageOwner.id,
        receiverId,
      );

      const receiver = await lastValueFrom(
        receiverObservable as unknown as Observable<any>,
      );
      const sender = await lastValueFrom(
        senderObservable as unknown as Observable<any>,
      );

      if (!conversation) {
        conversation = this.conversationRepository.create({
          sender: sender,
          receiver: receiver,
          status: EConversationStatus.ACTIVE,
        });
        conversation = await this.conversationRepository.save(conversation);
      }

      const recipients = [conversation.sender.id, conversation.receiver.id];

      const serializedFiles = (files || []).map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer.toString('base64'), // Convert buffer to base64 string
      }));

      const payload = {
        conversationId: conversation.id,
        createMessageDto,
        receiver: receiver,
        sender: sender,
        files: serializedFiles,
        recipients,
      };

      this.messageClient.emit(PATTERNS.SEND_MESSAGE, payload);
      return {
        converstion: {
          id: conversation.id,
        },
      };
    } catch (error) {
      Logger.error(
        '❌ Error sending platform message:',
        error?.message,
        error?.stack,
      );
      throw new InternalServerErrorException('Failed to send message');
      // Logger.error('Error sending platform message:', error);
      // this.exceptionHandler.throwInternalServerError(error);
    }
  }

  async existsByOwner(sender: MessageOwner, content: string) {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where(`message.owner->>'id' = :userId`, { userId: sender.id })
      .andWhere(`message.content = :content`, {
        content: content,
      });

    const message = await query.getOne();
    return !!message;
  }

  async createMessage(
    sender: MessageOwner,
    receiver: MessageOwner,
    createMessageDto: CreateMessageDto,
    files: Express.Multer.File[],
  ) {
    try {
      let conversation = await this.getConversationBySenderAndReceiver(
        sender.id,
        receiver.id,
      );

      if (!conversation) {
        conversation = this.conversationRepository.create({
          sender,
          receiver,
          status: EConversationStatus.ACTIVE,
        });
        await this.conversationRepository.save(conversation);
      }
      let sharedFiles = [];
      if (files.length > 0) {
        const sharedFilesObservables =
          await this.minioClientService.uploadMessageAttachments({ files });

        const sharedFilesResult = await lastValueFrom(
          sharedFilesObservables as unknown as Observable<any>,
        );

        sharedFiles = sharedFilesResult.result || [];
      }
      const message = this.messageRepository.create({
        ...createMessageDto,
        conversation,
        sharedFiles,
        owner: sender,
      });
      const savedMessage = await this.messageRepository.save(message);

      conversation.latestMessages = [
        ...(conversation.latestMessages || []),
        savedMessage,
      ];
      await this.conversationRepository.save(conversation);

      return savedMessage;
    } catch (error) {
      Logger.error('Error creating message:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, updateMessageDto: CreateMessageDto) {
    return this.messageRepository.update(messageId, updateMessageDto);
  }

  async getConversations(userId: string, page: number, limit: number) {
    try {
      console.log(
        `Getting conversations for userId: ${userId}, page: ${page}, limit: ${limit}`,
      );

      // Try a simpler approach first - get all conversations and filter in memory
      // This might be more efficient for small datasets
      const allConversations = await this.conversationRepository.find({
        order: {
          updatedAt: 'DESC',
          createdAt: 'DESC',
        },
        take: 1000, // Limit to prevent loading too many records
      });

      // Filter conversations where the user is either sender or receiver
      const userConversations = allConversations.filter(
        (conversation) =>
          conversation.sender?.id === userId ||
          conversation.receiver?.id === userId,
      );

      // Apply pagination
      const startIndex = page && limit ? (page - 1) * limit : 0;
      const endIndex =
        page && limit ? startIndex + limit : userConversations.length;
      const paginatedConversations = userConversations.slice(
        startIndex,
        endIndex,
      );

      console.log(
        `Found ${paginatedConversations.length} conversations, total: ${userConversations.length}`,
      );

      return createPaginatedResponse(
        paginatedConversations,
        userConversations.length,
        page,
        limit,
      );
    } catch (error) {
      console.error('Error in getConversations:', error);
      // Fallback to a simpler approach
      try {
        console.log('Using fallback method for getConversations');
        const allConversations = await this.conversationRepository.find({
          order: {
            updatedAt: 'DESC',
          },
          take: limit || 10,
        });

        const userConversations = allConversations.filter(
          (conversation) =>
            conversation.sender?.id === userId ||
            conversation.receiver?.id === userId,
        );

        return createPaginatedResponse(
          userConversations,
          userConversations.length,
          page,
          limit,
        );
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        // Return empty result instead of throwing error
        return createPaginatedResponse([], 0, page, limit);
      }
    }
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
  async getConversationBySenderAndReceiver(
    senderId: string,
    receiverId: string,
  ) {
    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        `(conversation.sender->>'id' = :senderId AND conversation.receiver->>'id' = :receiverId) OR (conversation.sender->>'id' = :receiverId AND conversation.receiver->>'id' = :senderId)`,
        { senderId: senderId, receiverId: receiverId },
      );

    return query.getOne();
  }

  async getMessage(messageId: string) {
    return this.messageRepository.findOne({
      where: { id: messageId },
    });
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
  async getSharedFilesAndUrlsInConversation(conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      select: {
        latestMessages: {
          sharedFiles: true,
        },
      },
    });

    if (!conversation?.latestMessages?.length) {
      return { sharedUrls: [], sharedFiles: [] };
    }

    const sharedFiles = conversation?.latestMessages
      .flatMap((message) => message.sharedFiles ?? [])
      .filter(Boolean);
    const sharedUrls = conversation?.latestMessages
      .flatMap((message) => message.urls ?? [])
      .filter(Boolean);

    return { sharedFiles, sharedUrls };
  }

  async createConversation(createConversationDto: CreateConversationRequest) {
    const existsBySenderAndReceiver =
      await this.getConversationBySenderAndReceiver(
        createConversationDto?.sender?.id,
        createConversationDto?.receiver?.id,
      );
    if (existsBySenderAndReceiver) {
      return existsBySenderAndReceiver;
    }
    const conversation = this.conversationRepository.create({
      sender: createConversationDto.sender,
      receiver: createConversationDto.receiver,
      status: EConversationStatus.ACTIVE,
    });
    const savedConversation =
      await this.conversationRepository.save(conversation);

    return {
      id: savedConversation.id,
      sender: savedConversation.sender,
      receiver: savedConversation.receiver,
      status: savedConversation.status,
    };
  }
}
