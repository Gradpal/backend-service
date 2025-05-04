import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSubjectDto } from './create-subject.dto';

export class UpdatePortfolioSubjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubjectDto)
  @ApiProperty({ type: [CreateSubjectDto] })
  subjects: CreateSubjectDto[];
}
