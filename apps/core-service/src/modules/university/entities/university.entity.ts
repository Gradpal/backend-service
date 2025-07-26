import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class University extends BaseEntity {
  @Column()
  universityName: string;
  @Column()
  countryName: string;
  @Column()
  universityEmailDomain: string;
}
