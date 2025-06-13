import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class PackageType extends BaseEntity {
  @Column({ type: 'int' })
  maximumSessions: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 100 })
  discount: number;
}
