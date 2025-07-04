import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreatePricingModelDto } from './dtos/create-pricing-model.dto';
import { CreatePricingRuleDto } from './dtos/create-pricing-rule.dto';
import { User } from '../user/entities/user.entity';
import { UpdateBulkPricingRuleDto } from './dtos/update-pricing-rules.dto';
import { PreAuthorize } from '@core-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { BuyCreditsDto } from './dtos/buy-credits.dto';

@Controller('finance')
@ApiTags('Finance')
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('pricing-model')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async createPricingModel(
    @Req() req,
    @Body() createPricingModelDto: CreatePricingModelDto,
  ) {
    return this.financeService.createPricingModel(
      req.user,
      createPricingModelDto,
    );
  }

  @Get('pricing-model/:id')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getPricingModelById(@Param('id') id: string) {
    return this.financeService.getPricingModelById(id);
  }

  @Put('pricing-model/:id')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async updatePricingModel(
    @Param('id') id: string,
    @Body() updatePricingModelDto: CreatePricingModelDto,
  ) {
    return this.financeService.updatePricingModel(id, updatePricingModelDto);
  }

  @Delete('pricing-model/:id')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async deletePricingModel(@Param('id') id: string) {
    return this.financeService.deletePricingModel(id);
  }

  @Get('pricing-models')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getPricingModels() {
    return this.financeService.getPricingModels();
  }

  @Post('pricing-rule')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async createPricingRule(
    @Req() req,
    @Body() createPricingRuleDto: CreatePricingRuleDto,
  ) {
    return this.financeService.createPricingRule(
      req.user as User,
      createPricingRuleDto,
    );
  }

  @Get('pricing-rule/:id')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getPricingRuleById(@Param('id') id: string) {
    return this.financeService.getPricingRuleById(id);
  }

  @Get('pricing-model/:pricingModelId/pricing-rules')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getPricingRules(@Param('pricingModelId') pricingModelId: string) {
    return this.financeService.getPricingRules(pricingModelId);
  }

  // @Put('pricing-rule/:id')
  // async updatePricingRule(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() updatePricingRuleDto: CreatePricingRuleDto,
  // ) {
  //   return this.financeService.updatePricingRule(
  //     req.user as User,
  //     id,
  //     updatePricingRuleDto,
  //   );
  // }

  @Put('pricing-rules/bulk')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async updateBulkPricingRuleValue(
    @Req() req,
    @Body() updateBulkPricingRuleValueDto: UpdateBulkPricingRuleDto,
  ) {
    return this.financeService.updateBulkPricingRuleValue(
      req.user as User,
      updateBulkPricingRuleValueDto,
    );
  }

  @Delete('pricing-rule/:id')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async deletePricingRule(@Req() req, @Param('id') id: string) {
    return this.financeService.deletePricingRule(req.user as User, id);
  }

  @Put('pricing-rules/reset-all/:pricingModelId')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async resetAllPricingRulesToDefault(
    @Req() req,
    @Param('pricingModelId') pricingModelId: string,
  ) {
    return this.financeService.resetAllPricingRulesToDefault(
      req.user as User,
      pricingModelId,
    );
  }

  @Get('history/whole')
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getWholeFinancialHistory() {
    return this.financeService.getWholeFinancialHistory();
  }

  @Post('buy-credits/:studentId')
  @PreAuthorize(EUserRole.PARENT)
  async buyCreditsForStudent(
    @Param('studentId') studentId: string,
    @Body() buyCreditsDto: BuyCreditsDto,
  ) {
    return this.financeService.buyCreditsForStudent(studentId, buyCreditsDto);
  }
}
