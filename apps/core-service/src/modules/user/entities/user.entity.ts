import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { BaseEntity } from '@app/common/database/base.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';
import { AcademicEmailVerificationDTO } from '../dto/create-user.dto';
import { TimeSlot } from '@core-service/modules/portfolio/weekly-availability/entities/weeky-availability.entity';
import { DeactivateUserDto } from '../dto/update-settings.dto';
@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column()
  email: string;

  @Column({ unique: false })
  password: string;

  @Column({ unique: true, nullable: true })
  userName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column()
  role: EUserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.NOT_VERIFIED,
  })
  status: EUserStatus;

  @Column({ nullable: true })
  referalCode: string;

  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ default: 0 })
  credits: number;

  @Column({ type: 'json', nullable: true })
  academicEmailVerfication: AcademicEmailVerificationDTO;

  @OneToOne(() => Portfolio)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.owner)
  timeSlots: TimeSlot[];

  @Column({ default: false })
  termsAndConditionsAccepted: boolean;

  @Column({ type: 'json', nullable: true })
  deactivation: DeactivateUserDto;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @Column('text', { array: true, nullable: true })
  secondEmails: string[];

  @Column('text', { array: true, nullable: true })
  secondPhoneNumbers: string[];
}
