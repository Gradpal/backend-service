import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';
import { CreateMessageDto } from '@notification-service/modules/chat/dtos/create-message.dto';
import { MessageOwner } from '@notification-service/modules/chat/dtos/message-owner.dto';

export interface Recipient {
  userId: string;
}

export interface PlatformQueuePayload {
  messageType: ENotificationMessageType;
  recipients: Recipient[];
  subject: string;
  metadata?: Record<string, object>;
}

export interface SerializedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: string; // base64 encoded buffer
}

export interface MessageQueuePayload {
  conversationId: string;
  createMessageDto: CreateMessageDto;
  receiver: MessageOwner;
  sender: MessageOwner;
  files: SerializedFile[];
  recipients: string[];
}
