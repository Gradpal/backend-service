import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PackageType } from './package-type.entity';
import { BaseEntity } from '@app/common/database/base.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { ClassSession } from '@core-service/modules/class-session/entities/class-session.entity';
import { PackageStatus } from '../enums/paclage-status.enum';

@Entity()
export class SessionPackage extends BaseEntity {
  @ManyToOne(() => PackageType, (packageType) => packageType)
  @JoinColumn({ name: 'package_type_id' })
  sessionPackageType: PackageType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.REQUESTED,
  })
  status: PackageStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @OneToMany(() => ClassSession, (classSession) => classSession.sessionPackage)
  classSessions: ClassSession[];
}
