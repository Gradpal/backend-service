import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  otp: number;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty()
  newPassword: string;
}
