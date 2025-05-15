import { BaseEntity } from '@app/common/database/base.entity';
import { ESubjectCategory } from '../enums/ESubjectCategory.enum';
import { Column, ManyToMany, JoinTable } from 'typeorm';
import { Entity } from 'typeorm';
import { SubjectTier } from '../subject-tier/entities/subject-tier.entity';

@Entity('subject')
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @Column()
  category: ESubjectCategory;

  @ManyToMany(() => SubjectTier, { cascade: true })
  @JoinTable({
    name: 'subjects_tiers',
    joinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_tier_id', referencedColumnName: 'id' },
  })
  subjectTiers: SubjectTier[];
}
