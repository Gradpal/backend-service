import { BaseEntity } from '@app/common/database/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EducationRecord } from './education-record.entity';

@Entity('portfolio')
export class Portfolio extends BaseEntity {
  @Column({ nullable: true })
  countryOfResidence: string;

  @Column({ nullable: true })
  currentTimezone: string;

  @Column({ nullable: true })
  timezoneDisplayFormat: string;

  @Column()
  religiousAffiliation: string;

  @Column({ nullable: true })
  appleCalendarToken: string;

  @Column({ nullable: true })
  googleCalendarToken: string;

  @Column({ type: 'json', nullable: true })
  countriesOfCitizenship: string[];

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ type: 'varchar', nullable: true })
  time_zone_display_format: string;

  @Column({ type: 'json', nullable: true })
  session_type: string[];

  @Column({ type: 'json', nullable: true })
  academicSubjects: string[];

  @Column({ type: 'json', nullable: true })
  paymentInfo: any;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  highestDegree: string;

  @Column({ type: 'varchar', nullable: true })
  country_of_residence: string;

  @Column({ type: 'varchar', nullable: true })
  university: string;

  @Column({ type: 'json', nullable: true })
  subjects: string[];

  @Column({ type: 'decimal', nullable: true })
  hourlyRate: number;

  @ManyToMany(() => EducationRecord, { cascade: true })
  @JoinTable()
  educationRecords: EducationRecord[];

  @Column({ type: 'text', nullable: true })
  introductoryVideo: string;

  @Column({ type: 'text', nullable: true })
  personalStatement: string;

  @Column({ type: 'boolean', nullable: true })
  complyingWithRules: boolean;

  @Column({ type: 'json', nullable: true })
  reviews: any;

  @Column({ type: 'json', nullable: true })
  weekelyAvailability: any;

  @Column({ type: 'json', nullable: true })
  google_calendar_credentials: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };

  @Column({ type: 'boolean', default: false })
  google_calendar_linked: boolean;

  @Column({ type: 'json', nullable: true })
  apple_calendar_credentials: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };

  @Column({ type: 'boolean', default: false })
  apple_calendar_linked: boolean;

  @Column({ type: 'integer', default: 0 })
  totalStudents: number;

  @Column({ type: 'integer', default: 0 })
  totalLessons: number;

  @Column({ type: 'decimal', default: 0 })
  attendanceRate: number;

  @Column({ type: 'decimal', default: 0 })
  responseRate: number;

  @Column({ type: 'integer', default: 0 })
  repeatStudents: number;

  @Column({ type: 'decimal', default: 5.0 })
  rating: number;

  @Column({ type: 'json', nullable: true })
  spokenLanguages: string[];

  @OneToOne(() => Portfolio)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
  @Column({ type: 'timestamp', nullable: true })
  last_seen: Date;

  @Column({ type: 'boolean', default: false })
  terms_and_conditions_agreed: boolean;
}
