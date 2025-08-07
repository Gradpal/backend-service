import { User } from '@core-service/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TimeSlot } from '@core-service/modules/portfolio/weekly-availability/entities/weeky-availability.entity';
import { AutonomousService } from '@core-service/modules/autonomous-service/entities/autonomous-service.entity';
import { IntroBookingStatus } from '../enums/intro-booking-status.enum';

@Entity('introductory_meeting')
export class IntroductoryMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => User)
  tutor: User;

  @ManyToOne(() => TimeSlot)
  timeSlot: TimeSlot;
  @ManyToOne(() => AutonomousService)
  autonomousService: AutonomousService;

  @Column({
    type: 'enum',
    enum: IntroBookingStatus,
    default: IntroBookingStatus.PENDING,
  })
  status: IntroBookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
