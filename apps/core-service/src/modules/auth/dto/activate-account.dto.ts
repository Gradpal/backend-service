import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class ActivateAccount {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  otp: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
