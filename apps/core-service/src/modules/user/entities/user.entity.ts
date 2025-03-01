import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  profile_photo: string;

  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @Column({ type: 'enum', enum: EUserStatus })
  status: EUserStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
