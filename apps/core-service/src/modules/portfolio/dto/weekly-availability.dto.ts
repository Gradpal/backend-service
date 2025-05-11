import { IsArray, IsEnum, IsString } from 'class-validator';

export enum WeekDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export class DayAvailability {
  @IsEnum(WeekDay)
  day: WeekDay;

  @IsArray()
  time_slots: TimeSlot[];
}

export class WeeklyAvailabilityDto {
  @IsArray()
  availability: DayAvailability[];

  @IsString()
  timezone_display_format: string;
}

export type TimeSlot = {
  start: string;
  end: string;
};

export type WeeklyAvailability = {
  [key: string]: TimeSlot[];
  sunday: TimeSlot[];
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
};
