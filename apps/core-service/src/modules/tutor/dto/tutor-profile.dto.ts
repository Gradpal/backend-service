import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Tutor } from '../entities/tutor.entity';

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

  static fromEntity(tutor: Tutor): TutorProfileDto {
    const dto = new TutorProfileDto();
    dto.id = tutor.id;
    dto.name = `${tutor.profile?.firstName} ${tutor.profile?.lastName}`;
    dto.profilePicture = tutor.profile?.profilePicture;
    dto.university = tutor.university;
    dto.isVerified = tutor.isVerified;
    dto.country = tutor.profile?.country_of_residence;
    dto.timezone = tutor.timezone;
    dto.userCode = tutor.profile?.userCode;
    dto.lastSeen = tutor.profile?.lastSeen;
    dto.rating = tutor.rating;
    dto.totalStudents = tutor.totalStudents;
    dto.totalLessons = tutor.totalLessons;
    dto.attendanceRate = tutor.attendanceRate;
    dto.responseRate = tutor.responseRate;
    dto.repeatStudents = tutor.repeatStudents;
    dto.personalStatement = tutor.personal_statement;
    dto.languages = tutor.languages?.value || [];
    dto.lessonTypes = tutor.session_type || [];
    dto.academicSubjects = tutor.academic_subjects || [];
    dto.introductoryVideo = tutor.introductory_video;
    return dto;
  }
}
