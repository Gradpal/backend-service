import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { ETierCategory } from '../enums/tier-category.enum';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity('subject_tier')
export class SubjectTier extends BaseEntity {
  @ManyToMany(() => Subject)
  @JoinTable({
    name: 'subjects_tiers',
    joinColumn: { name: 'subject_tier_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Subject[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @Column()
  category: ETierCategory;

  @Column()
  credits: number;
}
