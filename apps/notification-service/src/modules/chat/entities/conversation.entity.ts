import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';
import { EConversationStatus } from '../enums/conversation-status.enum';
import { Message } from './message.entity';
import { MessageOwner } from '../dtos/message-owner.dto';

@Entity()
export class Conversation extends BaseEntity {
  @Column({ type: 'jsonb', nullable: true })
  receiver: MessageOwner;

  @Column({ type: 'jsonb', nullable: true })
  sender: MessageOwner;

  @Column({
    type: 'enum',
    enum: EConversationStatus,
    default: EConversationStatus.ACTIVE,
  })
  status: EConversationStatus;

  @Column({ type: 'jsonb', nullable: true })
  latestMessages?: Message[];
}
