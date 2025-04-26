import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Portfolio } from '../entities/portfolio.entity';

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

  @ApiProperty()
  weeklyAvailability: {
    day: string;
    slots: {
      start: string;
      end: string;
    }[];
  }[];

  @ApiProperty()
  educationRecords: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
  }[];

  static fromEntity(user: User, portfolio: Portfolio): TutorProfileDto {
    const dto = new TutorProfileDto();
    dto.id = user.id;
    dto.name = `${user.firstName} ${user.lastName}`;
    dto.profilePicture = user.profilePicture;
    dto.university = portfolio.university;
    dto.isVerified = portfolio.isVerified;
    dto.country = portfolio.countryOfResidence;
    dto.timezone = portfolio.timezone;
    dto.rating = portfolio.rating;
    dto.totalStudents = portfolio.totalStudents;
    dto.totalLessons = portfolio.totalLessons;
    dto.attendanceRate = portfolio.attendanceRate;
    dto.responseRate = portfolio.responseRate;
    dto.repeatStudents = portfolio.repeatStudents;
    dto.personalStatement = portfolio.personalStatement;
    dto.languages = portfolio.languages?.value || [];
    dto.lessonTypes = portfolio.sessionType || [];
    dto.academicSubjects = portfolio.academicSubjects || [];
    dto.introductoryVideo = portfolio.introductoryVideo;
    dto.weeklyAvailability = portfolio.weeklyAvailability;
    dto.educationRecords = portfolio.educationRecords?.map((record) => ({
      institution: record.institution,
      degree: record.degree,
      fieldOfStudy: record.fieldOfStudy,
      startDate: record.startDate,
      endDate: record.endDate,
    }));
    return dto;
  }
}
