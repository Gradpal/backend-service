import { BaseEntity } from '@app/common/database/base.entity';
import { Subject } from '@core-service/modules/subjects/entities/subject.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { EAutonomousServiceStatus } from '../enums/autonomous-service-status.enum';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';

@Entity({ name: 'autonomous_service' })
export class AutonomousService extends BaseEntity {
  @Column()
  projectTitle: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: EAutonomousServiceStatus,
    default: EAutonomousServiceStatus.PENDING,
  })
  status: EAutonomousServiceStatus;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  isOwnerAnonymous: boolean;

  @Column()
  contractFinalizationDate: Date;

  @Column()
  finalSubmissionDate: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  preferredOutputFormats: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  attachments: AttachmentDto[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
