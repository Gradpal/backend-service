import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Visibility } from '../../tutor/dto/visibility.dto';

export class UpdateStudentProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  country_of_residence?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  current_timezone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  timezone_display_format?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  religious_affiliation?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  religious_affiliation_visible?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  gender_visible?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  apple_calendar_token?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  google_calendar_token?: string;
}
