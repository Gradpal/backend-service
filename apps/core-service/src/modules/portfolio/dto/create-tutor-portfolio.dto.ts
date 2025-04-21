import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { EDegreeType } from '../enums/degree-type.enumt';
import { EGender } from '@app/common/enums';
import { Type } from 'class-transformer';

export class EducationRecordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty({ enum: EDegreeType })
  @IsEnum(EDegreeType)
  @IsNotEmpty()
  degreeType: EDegreeType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startYear: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endYear: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  degreeCertification?: string;
}

export class CreateTutorPortfolioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryOfResidence: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  religiousAffiliation: string;

  @ApiProperty({ enum: EGender })
  @IsEnum(EGender)
  @IsNotEmpty()
  gender: EGender;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personalStatement: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timezoneDisplayFormat: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({ type: [EducationRecordDto] })
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => EducationRecordDto)
  educationRecords: EducationRecordDto[];

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  countriesOfCitizenship: string[];

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  spokenLanguages: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  introductoryVideo?: string;
}
