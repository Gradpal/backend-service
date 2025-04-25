import { ApiProperty } from '@nestjs/swagger';

export class TimeSlot {
  @ApiProperty()
  start: string;

  @ApiProperty()
  end: string;

  @ApiProperty()
  available: boolean;
}

export class DaySchedule {
  @ApiProperty()
  day: string;

  @ApiProperty({ type: [TimeSlot] })
  slots: TimeSlot[];
}

export class WeeklyScheduleDto {
  @ApiProperty({ type: [DaySchedule] })
  schedule: DaySchedule[];

  @ApiProperty()
  timezone: string;
} 