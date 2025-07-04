import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingModel } from './entities/prising-model.entity';
import { PricingRule } from './entities/pricing-rule.entity';
import { CreatePricingModelDto } from './dtos/create-pricing-model.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { CreatePricingRuleDto } from './dtos/create-pricing-rule.dto';
import { UpdateBulkPricingRuleDto } from './dtos/update-pricing-rules.dto';
import { FinanceHistory } from './entities/finance-history.entity';
import { User } from '../user/entities/user.entity';
import { EFinanceHistoryAction } from './enums/finance-history-action.enum';
import { BuyCreditsDto } from './dtos/buy-credits.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(PricingModel)
    private readonly pricingModelRepository: Repository<PricingModel>,
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(FinanceHistory)
    private readonly financeHistoryRepository: Repository<FinanceHistory>,
    private readonly userService: UserService,
    private exceptionHandler: ExceptionHandler,
  ) {}

  // Pricing Model CRUD

  async createPricingModel(
    loggedInUser: User,
    createPricingModelDto: CreatePricingModelDto,
  ) {
    const exists = await this.existsByTitle(createPricingModelDto.title);
    if (exists) {
      this.exceptionHandler.throwConflict(_409.PRICING_MODEL_ALREADY_EXISTS);
    }
    const pricingModel = this.pricingModelRepository.create(
      createPricingModelDto,
    );
    const financeHistory = this.financeHistoryRepository.create({
      action: EFinanceHistoryAction.CREATE_PRICING_MODEL,
      actor: loggedInUser,
      previousValue: {},
      newValue: pricingModel,
    });
    await Promise.all([
      this.pricingModelRepository.save(pricingModel),
      this.financeHistoryRepository.save(financeHistory),
    ]);
    return pricingModel;
  }

  async getPricingModelById(id: string) {
    return this.pricingModelRepository.findOne({
      where: { id },
      relations: ['pricingRules'],
    });
  }

  async updatePricingModel(
    id: string,
    updatePricingModelDto: CreatePricingModelDto,
  ) {
    return this.pricingModelRepository.update(id, updatePricingModelDto);
  }

  async getPricingModels() {
    return this.pricingModelRepository.find({
      relations: [
        'pricingRules',
        'pricingRules.children',
        'pricingRules.parent',
      ],
      order: {
        updatedAt: 'DESC',
      },
      select: {
        id: true,
        title: true,
        pricingRules: {
          id: true,
          title: true,
          description: true,
          value: true,
          type: true,
          category: true,
          condition: true,
          parent: {
            id: true,
            title: true,
          },
          children: {
            id: true,
            title: true,
            description: true,
            value: true,
            type: true,
            category: true,
            condition: true,
          },
        },
      },
    });
  }

  async existsByTitle(title: string) {
    const pricingModel = await this.pricingModelRepository.findOne({
      where: { title },
    });
    return !!pricingModel;
  }
  //

  async deletePricingModel(id: string) {
    return this.pricingModelRepository.delete(id);
  }

  // Pricing Rule CRUD

  async createPricingRule(
    loggedInUser: User,
    createPricingRuleDto: CreatePricingRuleDto,
  ) {
    const exists = await this.existsByTitle(createPricingRuleDto.title);
    if (exists) {
      this.exceptionHandler.throwConflict(_409.DATABASE_RECORD_ALREADY_EXISTS);
    }

    const pricingRule = this.pricingRuleRepository.create(createPricingRuleDto);
    pricingRule.pricingModel = await this.getPricingModelById(
      createPricingRuleDto.pricingModelId,
    );
    if (createPricingRuleDto.parentId) {
      const parent = await this.getPricingRuleById(
        createPricingRuleDto.parentId,
      );
      pricingRule.parent = parent;
    }

    const financeHistory = this.financeHistoryRepository.create({
      action: EFinanceHistoryAction.CREATE_PRICING_RULE,
      actor: loggedInUser,
      previousValue: {},
      newValue: ['Pricing rule', createPricingRuleDto.value],
    });
    const [savedPricingRule, financialHistory] = await Promise.all([
      this.pricingRuleRepository.save(pricingRule),
      this.financeHistoryRepository.save(financeHistory),
    ]);
    return savedPricingRule;
  }

  async getPricingRuleById(id: string) {
    return this.pricingRuleRepository.findOne({
      where: { id },
      relations: ['children', 'pricingModel', 'parent'],
      select: {
        id: true,
        title: true,
        description: true,
        value: true,
        type: true,
        category: true,
        condition: true,
        parent: {
          id: true,
          title: true,
        },
        children: {
          id: true,
          title: true,
          description: true,
          value: true,
          type: true,
          category: true,
          condition: true,
        },
      },
    });
  }

  async getPricingRules(pricingModelId: string) {
    return this.pricingRuleRepository.find({
      where: { pricingModel: { id: pricingModelId } },
      relations: ['children', 'pricingModel', 'parent'],
      select: {
        id: true,
        title: true,
        description: true,
        value: true,
        type: true,
        category: true,
        condition: true,
        parent: {
          id: true,
          title: true,
        },
        children: {
          id: true,
          title: true,
          description: true,
          value: true,
          type: true,
          category: true,
          condition: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async updatePricingRule(
    loggedInUser: User,
    id: string,
    updatePricingRuleDto: CreatePricingRuleDto,
  ) {
    const pricingRule = await this.pricingRuleRepository.findOne({
      where: { id },
    });
    if (!pricingRule) {
      this.exceptionHandler.throwNotFound(_404.PRICING_RULE_NOT_FOUND);
    }
    const financeHistory = this.financeHistoryRepository.create({
      action: EFinanceHistoryAction.UPDATE_PRICING_RULE,
      actor: loggedInUser,
      previousValue: ['Pricing rule value', pricingRule.value],
      newValue: ['Updated pricing rule', updatePricingRuleDto.value],
    });
    await Promise.all([
      this.pricingRuleRepository.update(id, updatePricingRuleDto),
      this.financeHistoryRepository.save(financeHistory),
    ]);
    return pricingRule;
  }

  async updateBulkPricingRuleValue(
    loggedInUser: User,
    updatePricingRuleValueDto: UpdateBulkPricingRuleDto,
  ) {
    await Promise.all(
      updatePricingRuleValueDto.pricingRules.map(async (pricingRule) => {
        const pricingRuleEntity = await this.pricingRuleRepository.findOne({
          where: { id: pricingRule.pricingRuleId },
        });
        if (!pricingRuleEntity) {
          this.exceptionHandler.throwNotFound(_404.PRICING_RULE_NOT_FOUND);
        }
        const financeHistory = this.financeHistoryRepository.create({
          action: EFinanceHistoryAction.UPDATE_PRICING_RULE_VALUE,
          actor: loggedInUser,
          previousValue: ['Pricing rule value', pricingRuleEntity.value],
          newValue: ['Updated pricing rule', pricingRule.newValue],
        });
        await Promise.all([
          this.pricingRuleRepository.update(pricingRule.pricingRuleId, {
            value: pricingRule.newValue,
          }),
          this.financeHistoryRepository.save(financeHistory),
        ]);
      }),
    );
  }

  async deletePricingRule(loggedInUser: User, id: string) {
    const pricingRule = await this.pricingRuleRepository.findOne({
      where: { id },
    });
    if (!pricingRule) {
      this.exceptionHandler.throwNotFound(_404.PRICING_RULE_NOT_FOUND);
    }
    const financeHistory = this.financeHistoryRepository.create({
      action: EFinanceHistoryAction.DELETE_PRICING_RULE,
      actor: loggedInUser,
      previousValue: ['Pricing rule', pricingRule.value],
      newValue: ['Deleted pricing rule', null],
    });
    await Promise.all([
      this.pricingRuleRepository.softDelete(id),
      this.financeHistoryRepository.save(financeHistory),
    ]);
  }
  async resetAllPricingRulesToDefault(
    loggedInUser: User,
    pricingModelId: string,
  ) {
    const pricingRules = await this.getPricingRules(pricingModelId);
    await Promise.all(
      pricingRules.map(async (pricingRule) => {
        const pricingRuleEntity = await this.pricingRuleRepository.findOne({
          where: { id: pricingRule.id },
        });
        if (!pricingRuleEntity) {
          this.exceptionHandler.throwNotFound(_404.PRICING_RULE_NOT_FOUND);
        }
        const financeHistory = this.financeHistoryRepository.create({
          action: EFinanceHistoryAction.RESET_ALL_PRICING_RULE_VALUE_TO_DEFAULT,
          actor: loggedInUser,
          previousValue: ['Pricing rule', pricingRule.value],
          newValue: ['Reset pricing rule', pricingRule.defaultValue],
        });
        await Promise.all([
          this.pricingRuleRepository.update(pricingRule.id, {
            value: pricingRule.defaultValue,
          }),
          this.financeHistoryRepository.save(financeHistory),
        ]);
      }),
    );
  }

  async getFinanceHistory(loggedInUser: User) {
    return this.financeHistoryRepository.find({
      where: {
        actor: { id: loggedInUser.id },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getWholeFinancialHistory() {
    return this.financeHistoryRepository.find({
      relations: ['actor'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async buyCreditsForStudent(studentId: string, buyCreditsDto: BuyCreditsDto) {
    const student = await this.userService.findOne(studentId);
    student.credits += buyCreditsDto.credits;
    return await this.userService.saveUser(student);
  }
}
