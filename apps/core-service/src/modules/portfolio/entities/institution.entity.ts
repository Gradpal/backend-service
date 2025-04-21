import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('institution')
export class Institution extends BaseEntity {
  @Column()
  name: string;
}
