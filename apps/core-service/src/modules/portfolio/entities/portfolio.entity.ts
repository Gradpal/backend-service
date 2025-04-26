import { BaseEntity } from '@app/common/database/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EducationRecord } from './education-record.entity';
import { Institution } from '../dto/institution.dto';

@Entity('portfolio')
export class Portfolio extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  countryOfResidence: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timezoneDisplayFormat: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  personalStatement: string;

  @Column({ nullable: true })
  introductoryVideo: string;

  @Column({ type: 'json', nullable: true })
  sessionType: string[];

  @Column({ type: 'json', nullable: true })
  academicSubjects: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalStudents: number;

  @Column({ type: 'int', default: 0 })
  totalLessons: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  attendanceRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  responseRate: number;

  @Column({ type: 'int', default: 0 })
  repeatStudents: number;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @OneToMany(
    () => EducationRecord,
    (educationRecord) => educationRecord.portfolio,
  )
  educationRecords: EducationRecord[];

  // Tutor specific fields
  @Column({ type: 'json', nullable: true })
  weeklyAvailability: any;

  @Column({ type: 'json', nullable: true })
  languages: { value: string[]; visible: boolean };

  @Column({ type: 'json', nullable: true })
  religiousAffiliation: { value: string; visible: boolean };

  @Column({ type: 'json', nullable: true })
  gender: { value: string; visible: boolean };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ type: 'boolean', default: false })
  termsAndConditionsAgreed: boolean;

  @Column({ nullable: true })
  currentTimezone: string;

  @Column({ type: 'json', nullable: true })
  countriesOfCitizenship: string[];

  @Column({ type: 'varchar', nullable: true })
  time_zone_display_format: string;

  @Column({ type: 'varchar', nullable: true })
  highestDegree: string;

  @Column({ type: 'json', nullable: true })
  subjects: string[];

  @Column({ type: 'decimal', nullable: true })
  hourlyRate: number;

  @Column({ type: 'text', nullable: true })
  complyingWithRules: boolean;

  @Column({ type: 'json', nullable: true })
  reviews: any;

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

  @Column({ type: 'timestamp', nullable: true })
  last_seen: Date;

  @Column({ type: 'json', nullable: true })
  institutions: Institution[];
}
