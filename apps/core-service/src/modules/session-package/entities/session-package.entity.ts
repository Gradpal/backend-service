import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PackageType } from './package-type.entity';
import { ClassSession } from '../../class-session/entities/class-session.entity';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity()
export class SessionPackage extends BaseEntity {
  @ManyToOne(() => PackageType, (packageType) => packageType)
  @JoinColumn({ name: 'package_type_id' })
  sessionPackageType: PackageType;

  @OneToMany(() => ClassSession, (classSession) => classSession)
  classSessions: ClassSession[];
}
