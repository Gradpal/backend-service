import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { BaseEntity } from '@app/common/database/base.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';

@Entity('subject_tier')
export class SubjectTier extends BaseEntity {
  @ManyToMany(() => Subject, { cascade: true })
  @JoinTable({
    name: 'subjects_tiers',
    joinColumn: { name: 'subject_tier_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @ManyToOne(() => Portfolio)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  category: string;

  @Column()
  credits: number;
}
