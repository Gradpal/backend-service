import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { Portfolio } from './portfolio.entity';

@Entity()
export class EducationRecord extends BaseEntity {
  @ManyToOne(() => Portfolio, (portfolio) => portfolio.educationRecords)
  portfolio: Portfolio;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'varchar', length: 255 })
  degree: string;

  @Column({ type: 'varchar', length: 255 })
  fieldOfStudy: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}
