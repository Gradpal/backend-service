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
}
