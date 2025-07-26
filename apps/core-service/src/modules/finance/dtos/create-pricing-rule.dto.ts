import { ApiProperty } from '@nestjs/swagger';
import { ERuleCondition } from '../enums/rule-condition.enum';
import { EPricingRuleType } from '../enums/pricing-rule-type.enum';
import { EPricingRuleCategory } from '../enums/pricing-rule-category.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePricingRuleDto {
  @ApiProperty({
    description: 'The title of the pricing rule',
    example: 'Pricing rule 1',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the pricing rule',
    example: 'Pricing rule 1 description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The condition of the pricing rule',
    example: 'Pricing rule 1 condition',
    required: false,
  })
  @IsOptional()
  condition: ERuleCondition;

  @ApiProperty({
    description: 'The value of the pricing rule',
    example: 'Pricing rule 1 value',
  })
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'The default value of the pricing rule',
    example: 'Pricing rule 1 default value',
  })
  @IsNotEmpty()
  defaultValue: number;

  @ApiProperty({
    description: 'The type of the pricing rule',
    example: 'Pricing rule 1 type',
  })
  @IsNotEmpty()
  @IsEnum(EPricingRuleType)
  type: EPricingRuleType;

  @ApiProperty({
    description: 'The category of the pricing rule',
    example: 'Pricing rule 1 category',
  })
  @IsNotEmpty()
  @IsEnum(EPricingRuleCategory)
  category: EPricingRuleCategory;

  @ApiProperty({
    description: 'The parent id of the pricing rule',
    example: 'Pricing rule 1 parent id',
    required: false,
  })
  @IsOptional()
  parentId: string;

  @ApiProperty({
    description: 'The pricing model id',
    example: 'Pricing model id',
    required: true,
  })
  @IsNotEmpty()
  pricingModelId: string;
}
