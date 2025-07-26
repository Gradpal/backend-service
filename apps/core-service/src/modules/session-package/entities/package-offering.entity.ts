import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { PackageType } from './package-type.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';

@Entity()
export class PackageOffering extends BaseEntity {
  @Column({ type: 'int' })
  discount: number;

  @ManyToOne(() => PackageType, (packageType) => packageType)
  @JoinColumn({ name: 'package_type_id' })
  packageType: PackageType;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.sessionPackageOfferings)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;
}
