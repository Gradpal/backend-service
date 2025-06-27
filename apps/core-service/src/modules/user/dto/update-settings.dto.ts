import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsStrongPassword()
  password: string;
}

export class DeactivateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;
}
