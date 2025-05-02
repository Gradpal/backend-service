import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { IsNumber } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { ETierCategory } from '../enums/tier-category.enum';
import { Type } from 'class-transformer';

export class CreateSubjectTierDto {
  @IsNotEmpty()
  @IsNumber()
  credits: number;

  @IsNotEmpty()
  @IsEnum(ETierCategory)
  category: ETierCategory;
}

export class CreateBulkSubjectTierDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectTierDto)
  subjectTiers: CreateSubjectTierDto[];
}

export class UpdateSubjectTierDto {
  @IsNumber()
  credits: number;

  @IsEnum(ETierCategory)
  category: ETierCategory;
}

export class AssignSubjectsDto {
  @IsArray()
  @IsString({ each: true })
  subjectIds: string[];
}
