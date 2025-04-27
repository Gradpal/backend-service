import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// Separate TimeSlot class with proper validation
class TimeSlot {
  @ApiProperty({ example: '09:00', description: 'Start time in HH:MM format' })
  @IsString()
  start: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:MM format' })
  @IsString()
  end: string;
}

export class UpdatePortfolioAvailabilityDto {
  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  sunday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  monday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  tuesday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  wednesday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  thursday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  friday: TimeSlot[];

  @ApiProperty({ type: [TimeSlot], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  @IsOptional()
  saturday: TimeSlot[];
}
