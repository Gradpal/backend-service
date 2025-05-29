import { BaseEntity } from '@app/common/database/base.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import {
  ESessionAcceptanceStatus,
  ESessionJoinStatus,
  ESessionStatus,
} from '../enums/session-status.enum';
import { Subject } from '@core-service/modules/subjects/entities/subject.entity';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { TimeSlot } from '@core-service/modules/portfolio/weekly-availability/entities/weeky-availability.entity';
import { SessionTimelineDto } from '../dto/session-timeline.dto';
import { SessionReviewDto } from '../dto/session-review.dto';

@Entity()
export class ClassSession extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column()
  goalDescription: string;

  @Column({ nullable: true, type: 'json' })
  urls: string[];

  @Column({
    type: 'varchar',
    default: ESessionStatus.SCHEDULED,
  })
  status: string;

  @Column({
    type: 'varchar',
    default: ESessionAcceptanceStatus.PENDING,
  })
  acceptanceStatus: string;

  @Column({
    type: 'varchar',
    default: ESessionJoinStatus.NONE_JOINED,
  })
  joinStatus: string;

  @Column({ default: null, nullable: true })
  extensionTime: Date;

  @Column({ default: null, nullable: true })
  startTime: Date;

  @Column({ default: null, nullable: true })
  endTime: Date;

  @Column({ default: null, nullable: true })
  meetLink: string;

  @Column({ type: 'json', nullable: true })
  notes: any;

  @Column({ type: 'json', nullable: true })
  cancelationReason: any;

  @Column({ type: 'json', nullable: true })
  attachments: AttachmentDto[];

  @ManyToMany(() => TimeSlot)
  @JoinTable({ name: 'session_time_slots' })
  timeSlots: TimeSlot[];

  @Column({ type: 'json', nullable: true })
  sessionTimelines: SessionTimelineDto[];

  @Column({ type: 'json', nullable: true })
  sessionReview: SessionReviewDto;
}
