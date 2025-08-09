import { ApiProperty } from '@nestjs/swagger';
import { TutorProfileDto } from './tutor-profile.dto';
import { User } from '../../user/entities/user.entity';
import { Portfolio } from '../entities/portfolio.entity';

export class UpcomingAppointmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentProfilePicture: string;

  @ApiProperty()
  sessionDate: string;

  @ApiProperty()
  sessionTime: string;

  @ApiProperty()
  subject: string;

  static fromEntity(booking: any): UpcomingAppointmentDto {
    /// remove this any and use the type
    const dto = new UpcomingAppointmentDto();
    dto.id = booking.id;
    dto.studentName = `${booking.student.firstName} ${booking.student.lastName}`;
    dto.studentProfilePicture = booking.student.profilePicture;
    dto.sessionDate = booking.sessionDate;
    dto.sessionTime = booking.sessionTime;
    dto.subject = booking.sessionType;
    return dto;
  }
}

export class TutorDashboardDto {
  @ApiProperty({ type: TutorProfileDto })
  profile: TutorProfileDto;

  @ApiProperty()
  wallet: {
    credits: number;
  };

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

  @ApiProperty()
  rating: number;

  @ApiProperty()
  hourlyRate: number;

  @ApiProperty()
  earnings: number;

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  upcomingAppointments: UpcomingAppointmentDto[];

  static fromEntity(
    user: User,
    portfolio: Portfolio,
    bookings: any[],
  ): TutorDashboardDto {
    const dto = new TutorDashboardDto();
    dto.totalStudents = portfolio.totalStudents || 0;
    dto.totalLessons = portfolio.totalLessons || 0;
    dto.attendanceRate = portfolio.attendanceRate || 0;
    dto.responseRate = portfolio.responseRate || 0;
    dto.repeatStudents = portfolio.repeatStudents || 0;
    dto.rating = portfolio.rating || 0;
    dto.hourlyRate = portfolio.hourlyRate || 0;
    dto.upcomingAppointments = bookings.map((booking) =>
      UpcomingAppointmentDto.fromEntity(booking),
    );
    return dto;
  }
}
