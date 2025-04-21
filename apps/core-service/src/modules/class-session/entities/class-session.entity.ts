import { BaseEntity } from '@app/common/database/base.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class ClassSession extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

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
