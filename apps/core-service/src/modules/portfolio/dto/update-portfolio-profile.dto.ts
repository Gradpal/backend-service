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
  degreeType: string;
  yearStarted: number;
  yearEnded: number;
  academicTranscript: Express.Multer.File;
  degreeCertificate: Express.Multer.File;
}

export class UpdatePortfolioProfileDto {
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  countriesOfCitizenship?: string[];

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
  religiousAffiliation?: Visibility<string>;

  @ApiProperty({ type: Visibility<string[]>, required: false })
  @IsOptional()
  languages?: Visibility<string[]>;

  @ApiProperty({ type: Visibility<string>, required: false })
  @IsOptional()
  gender?: Visibility<string>;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  sessionType?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  academicSubjects?: string[];

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
  countryOfResidence?: string;

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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  personalStatement?: string;

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

  @IsOptional()
  termsAndConditionsAgreed?: boolean;

  @ApiProperty({
    description: 'introductoryVideos - If any',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  introductoryVideos?: Express.Multer.File;

  @ApiProperty({
    description: 'academicTranscripts - If any',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  academicTranscripts?: Express.Multer.File[];

  @IsOptional()
  @ApiProperty({
    description: 'degreeCertificates - If any',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  degreeCertificates?: Express.Multer.File[];
}
