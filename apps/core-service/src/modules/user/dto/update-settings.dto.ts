import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsStrongPassword()
  @IsOptional()
  password?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  referralCode?: string;
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  countryOfResidence?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  displayTimezoneFormat?: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ type: [String] })
  secondEmails?: string[];

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ type: [String] })
  secondPhoneNumbers?: string[];
}

export class DeactivateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  reason: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  message: string;
}
