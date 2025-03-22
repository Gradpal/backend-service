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
  @IsNotEmpty()
  @ApiProperty()
  userName: string;

  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  referralCode?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  countryOfResidence: string;

  @IsNotEmpty()
  @ApiProperty()
  role: EUserRole;

  @ApiProperty({
    description: 'Profile picture',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profilePicture: Express.Multer.File;
}
