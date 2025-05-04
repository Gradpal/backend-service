import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { IsNumber } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { ETierCategory } from '../enums/tier-category.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectTierDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  credits: number;

  @IsNotEmpty()
  @IsEnum(ETierCategory)
  @ApiProperty({ enum: ETierCategory })
  category: ETierCategory;
}

export class CreateBulkSubjectTierDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectTierDto)
  @ApiProperty({ type: [CreateSubjectTierDto] })
  subjectTiers: CreateSubjectTierDto[];
}

export class UpdateSubjectTierDto {
  @IsNumber()
  credits: number;

  @IsEnum(ETierCategory)
  category: ETierCategory;
}

export class AssignSubjectsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  subjectTierId: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  subjectIds: string[];
}

export class AssignBulkSubjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignSubjectsDto)
  @ApiProperty({ type: [AssignSubjectsDto] })
  subjectTiers: AssignSubjectsDto[];
}
