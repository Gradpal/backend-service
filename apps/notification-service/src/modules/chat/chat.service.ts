import { Inject, Injectable } from '@nestjs/common';
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
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcServices } from '@core-service/common/constants/grpc.constants';
import { MinioClientService } from '@core-service/modules/minio-client/minio-client.service';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class ChatService {
  private minioClientService: MinioClientService;
  constructor(
    @InjectRepository(Conversation, DB_ROOT_NAMES.CHAT)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message, DB_ROOT_NAMES.CHAT)
    private readonly messageRepository: Repository<Message>,
    @Inject(CORE_GRPC_PACKAGE) private client: ClientGrpc,
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

  async createMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
    files: Express.Multer.File[],
  ) {
    const conversation = await this.getConversation(conversationId);
    const sharedFilesObservables =
      await this.minioClientService.uploadMessageAttachments({ files });

    const sharedFiles = await lastValueFrom(
      sharedFilesObservables as unknown as Observable<any>,
    );

    const message = this.messageRepository.create({
      ...createMessageDto,
      conversation,
      sharedFiles: sharedFiles.result,
    });
    return this.messageRepository.save(message);
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
