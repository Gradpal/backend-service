import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitBidDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The amount of the bid',
    example: 100,
  })
  bidAmount: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}
