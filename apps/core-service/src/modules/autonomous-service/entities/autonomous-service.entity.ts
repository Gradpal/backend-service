import { BaseEntity } from '@app/common/database/base.entity';
import { Subject } from '@core-service/modules/subjects/entities/subject.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { EAutonomousServiceStatus } from '../enums/autonomous-service-status.enum';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { Bid } from './bid.entity';
import { SessionReviewDto } from '@core-service/modules/class-session/dto/session-review.dto';
import { Invitation } from './invitation.entity';

@Entity({ name: 'autonomous_service' })
export class AutonomousService extends BaseEntity {
  @Column() projectTitle: string;

  @Column() description: string;

  @Column({
    type: 'enum',
    enum: EAutonomousServiceStatus,
    default: EAutonomousServiceStatus.DRAFT,
  })
  status: EAutonomousServiceStatus;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column() isOwnerAnonymous: boolean;

  @Column() contractFinalizationDate: Date;

  @Column() finalSubmissionDate: Date;

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
  @JoinColumn({ name: 'student_id' })
  student: User;

  @OneToMany(() => Bid, (bid) => bid.autonomousService) bids: Bid[];

  @Column({ type: 'json', nullable: true }) review: SessionReviewDto;
  @Column({ nullable: true, type: 'integer' })
  introductoryMeetingLength: number;
  @OneToMany(() => Invitation, (invitation) => invitation.autonomousService)
  invitations: Invitation[];
}
