import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TutorProfileDto {
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
  userCode: string;

  @ApiProperty()
  lastSeen: Date;

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
  personalStatement: string;

  @ApiProperty({ type: [String] })
  languages: string[];

  @ApiProperty({ type: [String] })
  lessonTypes: string[];

  @ApiProperty({ type: [String] })
  academicSubjects: string[];

  @ApiProperty()
  introductoryVideo: string;

  static fromEntity(tutor: User): TutorProfileDto {
    const dto = new TutorProfileDto();
    dto.id = tutor.id;
    dto.name = `${tutor?.firstName} ${tutor?.lastName}`;
    dto.profilePicture = tutor?.profilePicture;
    dto.university = tutor.portfolio.university;
    dto.isVerified = tutor.portfolio.isVerified;
    dto.country = tutor.portfolio?.countryOfResidence;
    dto.timezone = tutor.portfolio.timezone;
    dto.rating = tutor.portfolio.rating;
    dto.totalStudents = tutor.portfolio.totalStudents;
    dto.totalLessons = tutor.portfolio.totalLessons;
    dto.attendanceRate = tutor.portfolio.attendanceRate;
    dto.responseRate = tutor.portfolio.responseRate;
    dto.repeatStudents = tutor.portfolio.repeatStudents;
    dto.personalStatement = tutor.portfolio.personalStatement;
    dto.lessonTypes = tutor.portfolio.session_type || [];
    dto.academicSubjects = tutor.portfolio.academicSubjects || [];
    dto.introductoryVideo = tutor.portfolio.introductoryVideo;
    return dto;
  }
}
