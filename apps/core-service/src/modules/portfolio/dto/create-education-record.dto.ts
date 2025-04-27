import { IsString, IsDate, IsOptional } from 'class-validator';

export class CreateEducationRecordDto {
  @IsString()
  institution: string;

  @IsString()
  degree: string;

  @IsString()
  fieldOfStudy: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
