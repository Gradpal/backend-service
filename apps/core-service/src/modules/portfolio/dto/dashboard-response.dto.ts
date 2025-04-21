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
  name: string;

  @ApiProperty()
  avatar: string;

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
  totalLessons: number;

  @ApiProperty()
  attendanceRate: number;

  @ApiProperty()
  responseRate: number;

  @ApiProperty()
  repeatStudents: number;

  constructor(tutor: User) {
    this.id = tutor.id;
    this.name = tutor?.firstName + ' ' + tutor?.lastName;
    this.avatar = tutor?.profilePicture || '';
    this.institution = tutor.portfolio.university || '';
    this.country = tutor.portfolio?.countryOfResidence || '';
    this.time_zone = tutor.portfolio.timezone || '';
    // These fields need to be calculated from reviews/sessions
    this.rating = 0;
    this.totalStudents = 0;
    this.totalLessons = 0;
    this.attendanceRate = 0;
    this.responseRate = 0;
    this.repeatStudents = 0;
  }
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
