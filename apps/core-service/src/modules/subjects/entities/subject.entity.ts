import { BaseEntity } from '@app/common/database/base.entity';
import { Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Entity } from 'typeorm';
import { SubjectTier } from '../subject-tier/entities/subject-tier.entity';
import { SubjectCategory } from './subject-category.entity';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => SubjectTier, { cascade: true })
  @JoinTable({
    name: 'subjects_tiers',
    joinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_tier_id', referencedColumnName: 'id' },
  })
  subjectTiers: SubjectTier[];

  @ManyToOne(() => SubjectCategory, (category) => category.subjects)
  category: SubjectCategory;
}
