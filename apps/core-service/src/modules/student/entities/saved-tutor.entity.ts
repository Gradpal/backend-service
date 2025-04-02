import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';

@Entity('saved_tutors')
export class SavedTutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

  @Column({ name: 'tutor_id' })
  tutorId: string;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;
}
