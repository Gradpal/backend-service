import { ApiProperty } from '@nestjs/swagger';
import { TutorProfileDto } from './tutor-profile.dto';
import { Booking } from '../../booking/entities/booking.entity';

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

  static fromEntity(booking: Booking): UpcomingAppointmentDto {
    const dto = new UpcomingAppointmentDto();
    dto.id = booking.id;
    dto.studentName = `${booking.student.profile.firstName} ${booking.student.profile.lastName}`;
    dto.studentProfilePicture = booking.student.profile.profilePicture;
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

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  upcomingAppointments: UpcomingAppointmentDto[];
}
