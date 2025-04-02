import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class TutorListingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  profilePicture: string;

  @ApiProperty()
  university: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  country: string;

  @ApiProperty()
  timezone: string;

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

  @ApiProperty()
  hourlyRate: number;

  @ApiProperty({ type: [String] })
  languages: string[];

  @ApiProperty()
  lastSeen: Date;

  @ApiProperty()
  userCode: string;

  static fromEntity(user: User): TutorListingDto {
    const dto = new TutorListingDto();
    dto.id = user.id;
    dto.name = `${user.firstName} ${user.lastName}`;
    dto.profilePicture = user.profilePicture;
    dto.university = user.tutor?.university;
    dto.isVerified = user.tutor?.isVerified;
    dto.country = user.country_of_residence;
    dto.timezone = user.tutor?.timezone;
    dto.rating = user.tutor?.rating;
    dto.totalStudents = user.tutor?.totalStudents;
    dto.totalLessons = user.tutor?.totalLessons;
    dto.attendanceRate = user.tutor?.attendanceRate;
    dto.responseRate = user.tutor?.responseRate;
    dto.repeatStudents = user.tutor?.repeatStudents;
    dto.hourlyRate = user.tutor?.hourlyRate;
    dto.languages = user.tutor?.languages?.value || [];
    dto.lastSeen = user.lastSeen;
    dto.userCode = user.userCode;
    return dto;
  }
}
