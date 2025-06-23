import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePricingModelDto {
  @ApiProperty({
    description: 'The title of the pricing model',
    example: 'Pricing model 1',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
}
