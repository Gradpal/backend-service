import { Column, Entity, OneToMany } from 'typeorm';
import { Subject } from './subject.entity';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity()
export class SubjectCategory extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Subject, (subject) => subject.category)
  subjects: Subject[];
}
