import { User } from '@core-service/modules/user/entities/user.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export abstract class Person extends BaseEntity {
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'profile_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string;

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
  availability: any;

  @Column({ type: 'json', nullable: true })
  matching_questions: any;

  @Column({ type: 'json', nullable: true })
  languages: any;

  @Column({ type: 'json', nullable: true })
  citizenship: any;

  @Column({ type: 'json', nullable: true })
  reviews: any;

  @Column({ type: 'text', nullable: true })
  location: string;
}
