import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ClassSession } from '../../session-package/class-session/entities/class-session.entity';
import { Expose } from 'class-transformer';
import { EComplaintStatus } from '../enums/complaint-status.enum';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import {
  SessionComplaintReviewDto,
  SessionComplaintReviwDecisionDto,
} from '../dtos/complaint-review.dto';
import {
  ComplaintIssueType,
  ComplaintPriority,
} from '../enums/complaints.enum';
import { AutonomousService } from '@core-service/modules/autonomous-service/entities/autonomous-service.entity';
import { ComplaintCategory } from '../enums/complaint-category.enum';

@Entity('complaint')
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

  @ManyToOne(() => AutonomousService, { nullable: true })
  @Expose()
  @JoinColumn({ name: 'autonomous_service_id' })
  autonomousService: AutonomousService;

  @Column({
    type: 'enum',
    enum: ComplaintCategory,
    nullable: true,
    default: ComplaintCategory.CLASS_SESSION,
  })
  category: ComplaintCategory;

  @Column({ type: 'json', nullable: true })
  evidenceFiles: AttachmentDto[];

  @Column({ type: 'json', nullable: true })
  teacherReview: SessionComplaintReviewDto;

  @Column({ type: 'json', nullable: true })
  adminReviewDecision: SessionComplaintReviwDecisionDto;

  @Column({ type: 'json', nullable: true })
  adminNotes: string[];
}
