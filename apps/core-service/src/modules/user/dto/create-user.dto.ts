import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
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

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be at most 32 characters long' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one special character (!@#$%^&*)',
  })
  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'User password with at least 8 chars, uppercase, lowercase, number, and special char',
  })
  password: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  referralCode?: string;

  @IsString()
  @ApiPropertyOptional()
  countyOfCitizenShip?: string;

  @IsNotEmpty()
  @ApiProperty()
  role: EUserRole;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  profilePicture?: Express.Multer.File;
}

export class AcademicEmailVerificationDTO {
  @IsOptional()
  @ApiProperty()
  isValid: boolean;

  @IsOptional()
  @ApiProperty()
  message: string;
}
