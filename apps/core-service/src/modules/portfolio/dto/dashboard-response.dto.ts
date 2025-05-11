import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalSessions: number;

  @ApiProperty()
  conversationRate: number;

  @ApiProperty()
  responseRate: number;
}

export class UpcomingAppointmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tutorName: string;

  @ApiProperty()
  tutorAvatar: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  subject: string;
}

export class ScheduleEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  type: 'single' | 'recurring';

  @ApiProperty()
  tutorName: string;

  @ApiProperty()
  tutorAvatar: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  subject: string;
}

export class SavedTutorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  nationality: string;

  @ApiProperty()
  profilePicture: string;

  @ApiProperty()
  countryOfResidence: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  institution: string;

  @ApiProperty()
  verified: boolean;

  @ApiProperty()
  country: string;

  @ApiProperty()
  time_zone: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  totalSessions: number;

  @ApiProperty()
  attendanceRate: number;

  @ApiProperty()
  responseRate: number;

  @ApiProperty()
  repeatStudents: number;
}

export class StudentDashboardResponseDto {
  @ApiProperty()
  stats: DashboardStatsDto;

  @ApiProperty()
  credits: number;

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  upcomingAppointments: UpcomingAppointmentDto[];

  @ApiProperty({ type: [ScheduleEventDto] })
  schedule: ScheduleEventDto[];

  @ApiProperty({ type: [SavedTutorDto] })
  savedTutors: SavedTutorDto[];
}
