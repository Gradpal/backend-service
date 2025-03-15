import { Person } from '@app/common/database/person.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Student extends Person {
  @Column({ type: 'varchar', length: 255, nullable: true })
  academicLevel: string;

  @Column({ type: 'json', nullable: true })
  subjectsOfInterest: any;

  @Column({ type: 'json', nullable: true })
  languages: any;

  @Column({ type: 'text', nullable: true })
  preferredLearningStyle: string;

  @Column({ type: 'int', default: 0 })
  credits: number;
}
