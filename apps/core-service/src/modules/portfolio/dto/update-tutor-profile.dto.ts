import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsOptional,
  IsString,
} from 'class-validator';
import { Visibility } from '../dto/visibility.dto';
import { ApiProperty } from '@nestjs/swagger';

class InstitutionUpdate {
  name: string;
  degree_type: string;
  start_year: number;
  end_year: number;
  academic_transcript: Express.Multer.File;
  degree_certificate: Express.Multer.File;
}

export class UpdateTutorProfileDto {
  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  countries_of_citizenship?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  time_zone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  time_zone_display_format?: string;

  @ApiProperty({ type: Visibility<string>, required: false })
  @IsOptional()
  religious_affiliation?: Visibility<string>;

  @ApiProperty({ type: Visibility<string[]>, required: false })
  @IsOptional()
  languages?: Visibility<string[]>;

  @ApiProperty({ type: Visibility<string>, required: false })
  @IsOptional()
  gender?: Visibility<string>;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  session_type?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  academic_subjects?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  payment_info?: any;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  highest_degree?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country_of_residence?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  subjects?: string[];

  @ApiProperty({ required: false })
  @IsDecimal()
  @IsOptional()
  price_per_hour?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  institutions?: InstitutionUpdate[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  introductory_video?: Express.Multer.File;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  personal_statement?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  complying_with_rules?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  reviews?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  weekely_availability?: any;
}
