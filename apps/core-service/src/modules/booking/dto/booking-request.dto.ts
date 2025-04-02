import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class BookingRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tutorId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sessionType: string; // "1:1 Session" or "Direct autonomous Services Request"

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  selectedDate: string; // YYYY-MM-DD format

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  selectedTimeSlot: string; // HH:mm format

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  creditsToUse: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  materials?: Express.Multer.File;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
