import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ESessionStatus } from '../enums/session-status.enum';

export class ClassSessionDto {
  @IsNotEmpty()
  tutorId: string;

  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty()
  goalDescription: string;

  @IsArray()
  @IsOptional()
  urls?: string[];

  @IsEnum(ESessionStatus)
  @IsOptional()
  status?: ESessionStatus;

  @IsDate()
  @Type(() => Date)
  scheduled_time: Date;

  @IsOptional()
  notes?: any;
}
