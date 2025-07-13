import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';
import { EConversationStatus } from '../enums/conversation-status.enum';
import { Message } from './message.entity';
import { MessageOwnerDto } from '../dtos/message-owner.dto';

@Entity()
export class Conversation extends BaseEntity {
  @Column({ type: 'jsonb', nullable: true })
  receiver: MessageOwnerDto;

  @Column({ type: 'jsonb', nullable: true })
  sender: MessageOwnerDto;

  @Column({
    type: 'enum',
    enum: EConversationStatus,
    default: EConversationStatus.ACTIVE,
  })
  status: EConversationStatus;

  @Column({ type: 'jsonb', nullable: true })
  latestMessages?: Message[];
}
