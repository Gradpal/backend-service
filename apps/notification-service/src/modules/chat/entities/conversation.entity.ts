import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';
import { EConversationStatus } from '../enums/conversation-status.enum';
import { Message } from './message.entity';

@Entity()
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar' })
  receiverId: string;

  @Column({ type: 'varchar' })
  senderId: string;

  @Column({
    type: 'enum',
    enum: EConversationStatus,
    default: EConversationStatus.ACTIVE,
  })
  status: EConversationStatus;

  @Column({ type: 'jsonb', nullable: true })
  latestMessages?: Message[];
}
