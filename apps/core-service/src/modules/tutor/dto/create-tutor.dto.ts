import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateUserDTO } from '../../user/dto/create-user.dto';
import { Type } from 'class-transformer';
import { Institution } from './institution.dto';

export class CreateTutorDto extends CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone_number?: string;

  @ApiProperty()
  @IsNotEmpty()
  citizenship?: any;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referal_code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refererId: string;

  @IsArray()
  @IsOptional()
  countries_of_citizenship?: string[];

  @IsOptional()
  time_zone?: string;

  @IsOptional()
  religious_affiliation?: any;

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsOptional()
  gender?: string;

  @IsArray()
  @IsOptional()
  academic_subjects?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Institution)
  @IsOptional()
  institutions?: Institution[];

  @IsOptional()
  personal_statement?: string;

  // File upload fields will be handled by multer
  introductory_video?: Express.Multer.File;
  degree_certificates?: Express.Multer.File[];
}
