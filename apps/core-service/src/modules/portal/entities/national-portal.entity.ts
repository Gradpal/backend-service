import { BaseEntity } from '@app/common/database/base.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { EPortalStatus } from '../enums/portal-status.enum';

@Entity()
export class NationalPortal extends BaseEntity {
  @Column({ nullable: false })
  countryName: string;

  @Column({ nullable: false, unique: true })
  countryEmail: string;

  @Column({
    type: 'enum',
    enum: EPortalStatus,
    default: EPortalStatus.INACTIVE,
  })
  status: EPortalStatus;

  @OneToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}
