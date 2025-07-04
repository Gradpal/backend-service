import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class BuyCreditsDto {
  @ApiProperty({
    description: 'The number of credits to buy',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  credits: number;
}
