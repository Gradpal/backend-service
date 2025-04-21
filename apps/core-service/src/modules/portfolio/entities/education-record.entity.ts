import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Institution } from './institution.entity';

@Entity('education_record')
export class EducationRecord extends BaseEntity {
  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;
  @Column()
  degreeType: string;
  @Column()
  startYear: string;
  @Column()
  endYear: string;
  @Column()
  degreeCertificate?: string;
}
