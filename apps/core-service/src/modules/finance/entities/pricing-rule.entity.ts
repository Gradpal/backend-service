import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PricingModel } from './prising-model.entity';
import { EPricingRuleType } from '../enums/pricing-rule-type.enum';
import { EPricingRuleCategory } from '../enums/pricing-rule-category.enum';
import { BaseEntity } from '@app/common/database/base.entity';
import { ERuleCondition } from '../enums/rule-condition.enum';

@Entity('pricing_rule')
export class PricingRule extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ERuleCondition,
    nullable: true,
    default: null,
  })
  condition: ERuleCondition;

  @Column()
  value: number;

  @Column()
  defaultValue: number;

  @Column({ type: 'enum', enum: EPricingRuleType })
  type: EPricingRuleType;

  @ManyToOne(() => PricingRule, (prisingRule) => prisingRule.children)
  parent: PricingRule;

  @OneToMany(() => PricingRule, (prisingRule) => prisingRule.parent)
  children: PricingRule[];

  @Column({ type: 'enum', enum: EPricingRuleCategory })
  category: EPricingRuleCategory;

  @ManyToOne(() => PricingModel, (pricingModel) => pricingModel.pricingRules)
  pricingModel: PricingModel;
}
