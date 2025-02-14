import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EUserRole } from '../enums/user-role.enum';

export class OnboardUserDto {
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationNumber: string;

  @IsEnum(EUserRole)
  @IsNotEmpty()
  @ApiProperty()
  role: EUserRole;
}
