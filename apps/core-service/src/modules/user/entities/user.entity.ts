import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column()
  profile_photo: string;

  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.NOT_VERIFIED,
  })
  status: EUserStatus;

  @Column({ type: 'text', unique: true })
  referalCode: string;
}
