import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  ComplaintIssueType,
  ComplaintPriority,
} from '../enums/complaints.enum';
import { ClassSession } from './class-session.entity';
import { EComplaintStatus } from '../enums/complaint-status.enum';
import {
  SessionComplaintReviewDto,
  SessionComplaintReviwDecisionDto,
} from '../dto/complaint-review.dto';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { Expose } from 'class-transformer';

@Entity('session_complaint')
export class Complaint extends BaseEntity {
  @Column()
  issueType: ComplaintIssueType;

  @Column({ default: ComplaintPriority.LOW })
  priority: ComplaintPriority;

  @Column()
  description: string;

  @Column({
    default: EComplaintStatus.ADMIN_PENDING,
    enum: EComplaintStatus,
    type: 'enum',
  })
  status: EComplaintStatus;

  @ManyToOne(() => ClassSession)
  @Expose()
  @JoinColumn({ name: 'session_id' })
  session: ClassSession;

  @Column({ type: 'json', nullable: true })
  evidenceFiles: AttachmentDto[];

  @Column({ type: 'json', nullable: true })
  teacherReview: SessionComplaintReviewDto;

  @Column({ type: 'json', nullable: true })
  adminReviewDecision: SessionComplaintReviwDecisionDto;

  @Column({ type: 'json', nullable: true })
  adminNotes: string[];
}
