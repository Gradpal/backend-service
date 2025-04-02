import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { BaseEntity } from '@app/common/database/base.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'profile_photo' })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  country_of_residence: string;

  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.NOT_VERIFIED,
  })
  status: EUserStatus;

  @Column({ type: 'text', unique: true, nullable: true })
  referalCode: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  userCode: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @OneToOne(() => Tutor, (tutor) => tutor.profile)
  tutor: Tutor;

  referer?: User;
}
