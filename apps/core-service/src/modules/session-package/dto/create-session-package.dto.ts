import { BaseDto } from '@core-service/common/dtos/all.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePackageTypeDto {
  @ApiProperty({ description: 'Maximum sessions' })
  @IsNumber()
  @IsNotEmpty()
  maximumSessions: number;

  @ApiProperty({ description: 'Discount percentage' })
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateClassSessionPackageDto {
  @ApiProperty({ description: 'Package type ID' })
  @IsUUID()
  @IsNotEmpty()
  packageTypeId: string;

  @ApiProperty({ description: 'Session length in minutes' })
  @IsNumber()
  @IsNotEmpty()
  sessionLength: number;

  @ApiProperty({ description: 'Tutor ID' })
  @IsUUID()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Time slot IDs', required: false })
  @IsOptional()
  timeSlotIds?: string[];
}
