import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: ['Rwanda', 'Belgium'],
    description: 'List of countries of citizenship',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countriesOfCitizenship?: string[];

  @ApiProperty({
    example: ['English', 'French'],
    description: 'Languages spoken by the user',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({
    example: 'Germany',
    description: 'Country of residence',
    required: false,
  })
  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @ApiProperty({
    example: 'Africa/Kigali',
    description: 'Current timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentTimezone?: string;

  @ApiProperty({
    example: 'GMT+02:00',
    description: 'Display format of timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  time_zone_display_format?: string;

  @ApiProperty({
    example: 'Male',
    description: 'Gender of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    example: 'Christianity',
    description: 'Religious affiliation of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  religiousAffiliation?: string;
}
