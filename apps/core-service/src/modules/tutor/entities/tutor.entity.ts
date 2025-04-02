import { Person } from '@app/common/database/person.entity';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { Visibility } from '../dto/visibility.dto';
import { Institution } from '../dto/institution.dto';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Tutor extends Person {
  @OneToOne(() => User, (user) => user.tutor)
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @Column({ type: 'json', nullable: true })
  countries_of_citizenship: string[];

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ type: 'json', nullable: true })
  religious_affiliation: Visibility<string>;

  @Column({ type: 'json', nullable: true })
  languages: Visibility<string[]>;

  @Column({ type: 'json', nullable: true })
  gender: Visibility<string>;

  @Column({ type: 'json', nullable: true })
  session_type: string[];

  @Column({ type: 'json', nullable: true })
  academic_subjects: string[];

  @Column({ type: 'json', nullable: true })
  payment_info: any;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  highest_degree: string;

  @Column({ type: 'varchar', nullable: true })
  university: string;

  @Column({ type: 'json', nullable: true })
  subjects: string[];

  @Column({ type: 'decimal', nullable: true })
  hourlyRate: number;

  @Column({ type: 'json', nullable: true })
  institutions: Institution[];

  @Column({ type: 'text', nullable: true })
  introductory_video: string;

  @Column({ type: 'text', nullable: true })
  personal_statement: string;

  @Column({ type: 'boolean', nullable: true })
  complying_with_rules: boolean;

  @Column({ type: 'json', nullable: true })
  reviews: any;

  @Column({ type: 'json', nullable: true })
  weekely_availability: any;

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

  @Column({ type: 'timestamp', nullable: true })
  last_seen: Date;
}
