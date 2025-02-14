import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { EUserRole } from '../enums/user-role.enum';

export class CreateUserDTO {
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
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  // @IsEnum(EGender)
  // @IsOptional()
  // @ApiProperty({ required: false })
  // gender: EGender;

  // @IsOptional()
  // @ApiProperty({ required: false })
  // dob: Date;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({ required: false })
  // country: string;

  @IsNotEmpty()
  @ApiProperty()
  role: EUserRole;

  @IsOptional()
  @ApiProperty({ required: false })
  companyId?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  collegeId?: string;
}
