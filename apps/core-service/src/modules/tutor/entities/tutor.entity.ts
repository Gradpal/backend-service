import { Person } from '@app/common/database/person.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Tutor extends Person {
  @Column({ type: 'varchar', length: 50, nullable: true })
  time_zone: string;

  @Column({ type: 'json', nullable: true })
  payment_info: any;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  highest_degree: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  institution: string;

  @Column({ type: 'json', nullable: true })
  subjects: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_hour: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  optional_video: string;

  @Column({ type: 'json', nullable: true })
  reviews: any;
  @Column({ type: 'json', nullable: true })
  availability: any;

  @Column({ type: 'json', nullable: true })
  matching_questions: any;

  @Column({ type: 'json', nullable: true })
  languages: any;
}
