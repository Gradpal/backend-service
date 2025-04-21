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

export class TimeSlot {
  start_time: string; // Format: "HH:mm"
  end_time: string; // Format: "HH:mm"
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
