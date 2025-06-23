import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdatePricingRuleDto {
  @ApiProperty({
    description: 'The id of the pricing rule',
  })
  @IsNotEmpty()
  @IsString()
  pricingRuleId: string;

  @ApiProperty({
    description: 'The new value of the pricing rule',
    example: 34,
  })
  @IsNotEmpty()
  @IsNumber()
  newValue: number;
}
export class UpdateBulkPricingRuleDto {
  @ValidateNested({ each: true })
  @Type(() => UpdatePricingRuleDto)
  @ApiProperty({ type: UpdatePricingRuleDto, isArray: true })
  pricingRules: UpdatePricingRuleDto[];
}
