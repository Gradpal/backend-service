import { Person } from '@app/common/database/person.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Student extends Person {
  @Column({ type: 'varchar', length: 255, nullable: true })
  academic_level: string;

  @Column({ type: 'json', nullable: true })
  subjects_of_interest: any;

  @Column({ type: 'json', nullable: true })
  languages: any;

  @Column({ type: 'text', nullable: true })
  preferred_learning_style: string;
}
