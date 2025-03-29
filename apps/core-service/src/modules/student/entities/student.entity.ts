import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Visibility } from '../../tutor/dto/visibility.dto';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @Column({ name: 'profile_id' })
  profileId: string;

  @Column({ type: 'integer', default: 0 })
  credits: number;

  @Column({ nullable: true })
  country_of_residence: string;

  @Column({ nullable: true })
  current_timezone: string;

  @Column({ nullable: true })
  timezone_display_format: string;

  @Column({ type: 'jsonb', nullable: true })
  religious_affiliation: Visibility<string>;

  @Column({ type: 'jsonb', nullable: true })
  gender: Visibility<string>;

  @Column({ nullable: true })
  apple_calendar_token: string;

  @Column({ nullable: true })
  google_calendar_token: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
