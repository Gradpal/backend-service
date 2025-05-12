import { BaseEntity } from '@app/common/database/base.entity';
import { Column, ManyToOne, JoinColumn } from 'typeorm';

import { Entity } from 'typeorm';
import { WeekDay } from '../../dto/weekly-availability.dto';
import { User } from '@core-service/modules/user/entities/user.entity';

@Entity('weekly_availability')
export class WeeklyAvailability extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  timezone: string;
}

@Entity('day_schedule')
export class DaySchedule extends BaseEntity {
  @Column()
  day: WeekDay;

  @ManyToOne(() => WeeklyAvailability)
  @JoinColumn({ name: 'weekly_availability_id' })
  weeklyAvailability: WeeklyAvailability;
}

@Entity('time_slot')
export class TimeSlot extends BaseEntity {
  @Column()
  startTime: string; // Format: "HH:mm"

  @Column()
  endTime: string; // Format: "HH:mm"

  @Column({ nullable: true, default: false })
  isBooked: boolean;

  @ManyToOne(() => DaySchedule)
  @JoinColumn()
  daySchedule: DaySchedule;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
