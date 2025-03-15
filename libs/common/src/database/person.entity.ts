import { User } from '@core-service/modules/user/entities/user.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export abstract class Person extends BaseEntity {
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string;

  @Column({ type: 'json', nullable: true })
  citizenship: any;

  @Column()
  country: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referer_id' })
  referer: User;
}
