import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingModel } from './entities/prising-model.entity';
import { PricingRule } from './entities/pricing-rule.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(PricingModel)
    private readonly pricingModelRepository: Repository<PricingModel>,
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
  ) {}
}
