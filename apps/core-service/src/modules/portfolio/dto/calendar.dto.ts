import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class GoogleCalendarCredentials {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CalendarEvent {
  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsNotEmpty()
  start: Date;

  @IsDate()
  @IsNotEmpty()
  end: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;
}

export class CalendarSyncResponse {
  success: boolean;
  events?: CalendarEvent[];
  error?: string;
  message?: string;
}
