import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateClassSessionDto {
  @ApiProperty({ description: 'Tutor ID' })
  @IsUUID()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Subject of the session' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Price per session' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Goal description for the session' })
  @IsString()
  @IsNotEmpty()
  goalDescription: string;

  @ApiProperty({ description: 'Scheduled time for the session' })
  @IsNotEmpty()
  scheduled_time: Date;

  @ApiProperty({ description: 'Additional URLs (optional)', required: false })
  urls?: string[];

  @ApiProperty({ description: 'Additional notes (optional)', required: false })
  notes?: any;
}
