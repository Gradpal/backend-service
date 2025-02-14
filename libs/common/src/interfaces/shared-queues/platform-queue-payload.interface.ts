import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';

export interface Recipient {
  userId: string;
}

export interface PlatformQueuePayload {
  messageType: ENotificationMessageType;
  recipients: Recipient[];
  subject: string;
  metadata?: Record<string, object>;
}
