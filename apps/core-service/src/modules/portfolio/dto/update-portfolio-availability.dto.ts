import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// Separate TimeSlot class with proper validation
export class TimeSlotDto {
  @ApiProperty({ example: '09:00', description: 'Start time in HH:MM format' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:MM format' })
  @IsString()
  endTime: string;
}

export class UpdatePortfolioAvailabilityDto {
  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  sunday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  monday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  tuesday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  wednesday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  thursday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  friday: TimeSlotDto[];

  @ApiProperty({ type: [TimeSlotDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  saturday: TimeSlotDto[];
}

export class UpdateDeactivateTimeSlotDto {
  @ApiProperty({ type: UpdatePortfolioAvailabilityDto, required: true })
  @ValidateNested()
  @Type(() => UpdatePortfolioAvailabilityDto)
  @IsOptional()
  newAvailability: UpdatePortfolioAvailabilityDto;

  @ApiProperty({ type: [String], required: true })
  @IsArray()
  @IsString({ each: true })
  deactivatedTimeSlotIds: string[];
}
