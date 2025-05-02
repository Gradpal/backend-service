import { BaseEntity } from '@app/common/database/base.entity';
import { ESubjectCategory } from '../enums/ESubjectCategory.enum';
import { Column } from 'typeorm';
import { Entity } from 'typeorm';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @Column()
  category: ESubjectCategory;
}
