import { Person } from '@app/common/database/person.entity';
import { Column, Entity } from 'typeorm';
import { Visibility } from '../dto/visibility.dto';
import { Institution } from '../dto/institution.dto';

@Entity()
export class Tutor extends Person {
  @Column({ type: 'json', nullable: true })
  countries_of_citizenship: string[];

  @Column({ type: 'varchar', nullable: true })
  time_zone: string;

  @Column({ type: 'json', nullable: true })
  religious_affiliation: Visibility<string>;

  @Column({ type: 'json', nullable: true })
  languages: Visibility<string[]>;

  @Column({ type: 'json', nullable: true })
  gender: Visibility<string>;

  @Column({ type: 'json', nullable: true })
  session_type: string[];

  @Column({ type: 'json', nullable: true })
  academic_subjects: string[];

  @Column({ type: 'json', nullable: true })
  payment_info: any;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  highest_degree: string;

  @Column({ type: 'varchar', nullable: true })
  institution: string;

  @Column({ type: 'json', nullable: true })
  subjects: string[];

  @Column({ type: 'decimal', nullable: true })
  price_per_hour: number;

  @Column({ type: 'json', nullable: true })
  institutions: Institution[];

  @Column({ type: 'text', nullable: true })
  introductory_video: string;

  @Column({ type: 'text', nullable: true })
  personal_statement: string;

  @Column({ type: 'boolean', nullable: true })
  complying_with_rules: Boolean;

  @Column({ type: 'json', nullable: true })
  reviews: any;
  @Column({ type: 'json', nullable: true })
  weekely_availability: any;
}
