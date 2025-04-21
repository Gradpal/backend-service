import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { BaseEntity } from '@app/common/database/base.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column()
  role: EUserRole;

  @Column()
  phoneNumber: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.NOT_VERIFIED,
  })
  status: EUserStatus;

  @Column()
  referalCode: string;

  @Column({ default: 0 })
  credits: number;

  @OneToOne(() => Portfolio)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;
}
