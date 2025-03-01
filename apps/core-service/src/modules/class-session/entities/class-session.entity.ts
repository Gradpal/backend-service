import { BaseEntity } from '@app/common/database/base.entity';
import { Student } from '@core-service/modules/student/entities/student.entity';
import { Tutor } from '@core-service/modules/tutor/entities/tutor.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class ClassSession extends BaseEntity {
  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutor_id' })
  tutor: Tutor;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'varchar', length: 255, nullable: false })
  subject: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: 'scheduled' | 'completed' | 'canceled';

  @Column({ type: 'timestamp', nullable: false })
  scheduled_time: Date;

  @Column({ type: 'json', nullable: true })
  notes: any;
}
