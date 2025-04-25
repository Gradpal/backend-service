import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class WeeklyAvailabilityDto {
  @ApiProperty()
  @IsObject()
  @IsOptional()
  monday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  tuesday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  wednesday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  thursday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  friday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  saturday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
  sunday?: {
    available: boolean;
    slots: { start: string; end: string }[];
  };
} 