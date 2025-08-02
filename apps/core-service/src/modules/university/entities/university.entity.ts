import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity()
export class University extends BaseEntity {
  @Column({ name: 'university_name' }) universityName: string;
  @Column({ name: 'country_name' }) countryName: string;
  @Column(
    'text',

    {
      array: true,
      name: 'university_email_domains',
      nullable: true,
    },
  )
  universityEmailDomains: string[];
}
