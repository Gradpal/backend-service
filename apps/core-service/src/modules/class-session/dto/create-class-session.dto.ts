import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseDto } from '@core-service/common/dtos/all.dto';

export class CreateClassSessionDto extends BaseDto {
  @ApiProperty({ description: 'Tutor ID' })
  @IsUUID()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'Subject of the session' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Scheduled time for the session' })
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({ description: 'End time for the session' })
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ description: 'Additional URLs (optional)', required: false })
  @IsOptional()
  urls?: string[];

  @ApiProperty({ description: 'Additional notes (optional)', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Time slot IDs', required: false })
  @IsOptional()
  timeSlotIds?: string[];
}
