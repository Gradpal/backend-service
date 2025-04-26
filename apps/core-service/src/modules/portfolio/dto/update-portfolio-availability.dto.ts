import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpdatePortfolioAvailabilityDto {
  @IsArray()
  @IsOptional()
  weeklyAvailability?: {
    day: string;
    slots: {
      start: string;
      end: string;
    }[];
  }[];
}
