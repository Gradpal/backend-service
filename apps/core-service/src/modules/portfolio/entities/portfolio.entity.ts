import { BaseEntity } from '@app/common/database/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EducationInstitutionRecord } from './education-record.entity';
import { Institution } from '../dto/institution.dto';
import { SubjectTier } from '@core-service/modules/subjects/subject-tier/entities/subject-tier.entity';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { Subject } from '@core-service/modules/subjects/entities/subject.entity';
import { SavedTutorDto } from '../dto/dashboard-response.dto';
import { EVerificationStatus } from '../../user/enums/verification-status.enum';

@Entity('portfolio')
export class Portfolio extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  university: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  countryOfResidence: string;

  @Column({ length: 255, nullable: true })
  timezone: string;

  @Column({ length: 255, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timezoneDisplayFormat: string;

  @Column({ type: 'text', nullable: true })
  personalStatement: string;

  @Column({ nullable: true })
  introductoryVideo: string;

  @Column({ type: 'json', nullable: true })
  sessionType: string[];

  @Column({ type: 'json', nullable: true })
  academicSubjects: string[];

  @Column({ type: 'json', nullable: true })
  academicTranscripts: AttachmentDto[];

  @Column({ type: 'json', nullable: true })
  degreeCertificates: AttachmentDto[];

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ type: 'int', nullable: true })
  totalStudents: number;

  @Column({ type: 'int', nullable: true })
  totalLessons: number;

  @Column({ type: 'float', nullable: true })
  attendanceRate: number;

  @Column({ type: 'float', nullable: true })
  responseRate: number;

  @Column({ type: 'int', default: 0 })
  repeatStudents: number;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'json', nullable: true })
  verificationDocuments: string[];

  @Column({
    type: 'enum',
    enum: EVerificationStatus,
    default: EVerificationStatus.PENDING,
  })
  verificationStatus: EVerificationStatus;

  @Column({ type: 'json', nullable: true })
  educationInstitutionRecords: EducationInstitutionRecord[];

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

  @ManyToOne(() => User, (user) => user.portfolio)
  @JoinColumn()
  user: User;

  @Column({ type: 'json', nullable: true })
  savedTutors: SavedTutorDto[];

  @ManyToMany(() => Subject)
  @JoinTable({
    name: 'portfolio_subjects',
    joinColumn: {
      name: 'portfolio_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subject_id',
      referencedColumnName: 'id',
    },
  })
  subjects: Subject[];

  @OneToMany(() => SubjectTier, (subjectTier) => subjectTier.portfolio)
  subjectTiers: SubjectTier[];

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

  @ManyToMany(() => Subject)
  @JoinTable({
    name: 'portfolio_subjects_of_interest',
    joinColumn: {
      name: 'portfolio_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subject_id',
      referencedColumnName: 'id',
    },
  })
  subjectsOfInterest: Subject[];
}
