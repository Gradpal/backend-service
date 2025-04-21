import { ApiProperty } from '@nestjs/swagger';

export enum WeekDay {
  MON = 'Mon',
  TUE = 'Tue',
  WED = 'Wed',
  THU = 'Thur',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

export class TimeSlot {
  @ApiProperty()
  startTime: string; // Format: "HH:mm"

  @ApiProperty()
  endTime: string; // Format: "HH:mm"

  @ApiProperty()
  isBooked: boolean;
}

export class DaySchedule {
  @ApiProperty({ enum: WeekDay })
  day: WeekDay;

  @ApiProperty({ type: [TimeSlot] })
  timeSlots: TimeSlot[];
}

export class WeeklyScheduleDto {
  @ApiProperty({ type: [DaySchedule] })
  schedule: DaySchedule[];

  @ApiProperty()
  timezone: string;
}
