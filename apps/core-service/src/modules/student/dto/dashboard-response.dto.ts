import { ApiProperty } from '@nestjs/swagger';
import { Tutor } from '../../tutor/entities/tutor.entity';

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

  constructor(tutor: Tutor) {
    this.id = tutor.id;
    this.name = tutor.profile?.firstName + ' ' + tutor.profile?.lastName;
    this.avatar = tutor.profile?.profilePicture || '';
    this.institution = tutor.university || '';
    this.verified = tutor.isVerified || false;
    this.country = tutor.profile?.country_of_residence || '';
    this.time_zone = tutor.timezone || '';
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
