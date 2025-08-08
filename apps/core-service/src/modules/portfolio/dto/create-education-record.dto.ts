import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { EDegreeType } from '../enums/degree-type.enumt';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateEducationInstitutionRecordDto {
  @IsString()
  @ApiProperty({ required: true })
  @IsNotEmpty()
  institutionName: string;

  @IsString()
  @ApiPropertyOptional({ default: false })
  isHighSchoolTeacher: boolean;
  @IsString()
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(EDegreeType)
  degreeType: EDegreeType;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: true })
  startYear?: string;

  @IsString()
  @ApiProperty({ required: true })
  @IsOptional()
  endYear?: string;

  @ApiProperty({ required: false })
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  certificate?: Express.Multer.File;
}
