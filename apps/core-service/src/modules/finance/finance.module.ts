import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingRule } from './entities/pricing-rule.entity';
import { PricingModel } from './entities/prising-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PricingModel, PricingRule])],
  providers: [FinanceService],
  controllers: [FinanceController],
})
export class FinanceModule {}
