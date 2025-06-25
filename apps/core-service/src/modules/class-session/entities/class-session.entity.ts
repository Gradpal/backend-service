import { BaseEntity } from '@app/common/database/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
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
import { SessionPackage } from '@core-service/modules/session-package/entities/session-package.entity';

@Entity()
export class ClassSession extends BaseEntity {
  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ nullable: true })
  goalDescription: string;

  @Column({ nullable: true, type: 'json' })
  urls: string[];

  @Column({ default: false, nullable: true })
  isConfirmed: boolean;

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

  @ManyToOne(() => TimeSlot)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlot;

  @Column({ default: null, nullable: true })
  meetLink: string;

  @Column({ type: 'json', nullable: true })
  notes: any;

  @Column({ type: 'json', nullable: true })
  cancelationReason: any;

  @Column({ type: 'json', nullable: true })
  attachments: AttachmentDto[];

  @Column({ type: 'json', nullable: true })
  sessionTimelines: SessionTimelineDto[];

  @Column({ type: 'json', nullable: true })
  sessionReview: SessionReviewDto;

  @ManyToOne(
    () => SessionPackage,
    (sessionPackage) => sessionPackage.classSessions,
  )
  @JoinColumn({ name: 'session_package_id' })
  sessionPackage: SessionPackage;
}
