import { Column, Entity, OneToMany } from 'typeorm';
import { PricingRule } from './pricing-rule.entity';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity('pricing_model')
export class PricingModel extends BaseEntity {
  @Column()
  title: string;

  @OneToMany(() => PricingRule, (pricingRule) => pricingRule.pricingModel)
  pricingRules: PricingRule[];
}
