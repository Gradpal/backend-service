import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BuyCreditsDto {
  @IsNotEmpty()
  @ApiProperty()
  credits: number;
}
