import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EMessageStatus } from '../enums/message-status.enum';
import { Conversation } from './conversation.entity';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { MessageOwner } from '../dtos/message-owner.dto';

@Entity()
export class Message extends BaseEntity {
  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  urls: string[];

  @Column({
    type: 'enum',
    enum: EMessageStatus,
    default: EMessageStatus.SENT,
  })
  status: EMessageStatus;

  @Column({ type: 'jsonb', nullable: true })
  owner: MessageOwner;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @Column({ type: 'jsonb', nullable: true })
  sharedFiles: AttachmentDto[];
}
