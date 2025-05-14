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

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subjectsIds: string[];

  @IsNotEmpty()
  @IsString()
  category: string;
}

export class InitializeSubjectTierDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectTierDto)
  @ApiProperty({ type: [CreateSubjectTierDto] })
  subjectTiers: CreateSubjectTierDto[];
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

export class MoveSubjectFromOneTierToAnotherDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  originTierId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  destinationTierId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  subjectId: string;
}

export class AssignBulkSubjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MoveSubjectFromOneTierToAnotherDto)
  @ApiProperty({ type: [MoveSubjectFromOneTierToAnotherDto] })
  subjectTiers: MoveSubjectFromOneTierToAnotherDto[];
}
