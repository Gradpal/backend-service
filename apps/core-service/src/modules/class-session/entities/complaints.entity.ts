import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  ComplaintIssueType,
  ComplaintPriority,
} from '../enums/complaints.enum';
import { ClassSession } from './class-session.entity';

@Entity('session_complaint')
export class Complaint extends BaseEntity {
  @Column()
  issueType: ComplaintIssueType;

  @Column({ default: ComplaintPriority.LOW })
  priority: ComplaintPriority;

  @Column()
  description: string;

  @ManyToOne(() => ClassSession)
  @JoinColumn({ name: 'session_id' })
  session: ClassSession;

  @Column({ nullable: true })
  evidenceFileUrl: string;
}
