import { BaseEntity } from '@app/common/database/base.entity';
<<<<<<< HEAD
import { Column, Entity, Index, ManyToOne } from 'typeorm';
=======
import { Column, Entity, Index } from 'typeorm';
>>>>>>> 77db3d2 (feat: add duplicates check while creating the a conversation)
import { EConversationStatus } from '../enums/conversation-status.enum';
import { Message } from './message.entity';
import { User } from '@notification-service/modules/user/entities/user.entity';

@Entity()
@Index(['sender', 'receiver'])
export class Conversation extends BaseEntity {
  @ManyToOne(() => User, { nullable: true })
  receiver: User;

  @ManyToOne(() => User, { nullable: true })
  sender: User;

  @Column({
    type: 'enum',
    enum: EConversationStatus,
    default: EConversationStatus.ACTIVE,
  })
  status: EConversationStatus;

  @Column({ type: 'jsonb', nullable: true })
  latestMessages?: Message[];
}
