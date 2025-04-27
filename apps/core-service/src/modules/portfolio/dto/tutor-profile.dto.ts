import { Expose, Transform } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Portfolio } from '../entities/portfolio.entity';
export type TimeSlot = {
  start: string;
  end: string;
};
export type WeeklyAvailability = {
  [key: string]: TimeSlot[];
  sunday: TimeSlot[];
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
}; 
export class TutorProfileDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.rating || 0)
  rating: number;

  @Expose()
  @Transform(({ obj }) => obj.totalStudents || 0)
  totalStudents: number;

  @Expose()
  @Transform(({ obj }) => obj.totalLessons || 0)
  totalLessons: number;

  @Expose()
  @Transform(({ obj }) => obj.attendanceRate || 0)
  attendanceRate: number;

  @Expose()
  @Transform(({ obj }) => obj.responseRate || 0)
  responseRate: number;

  @Expose()
  @Transform(({ obj }) => obj.personalStatement || '')
  personalStatement: string;

  @Expose()
  @Transform(({ obj }) => obj.languages || [])
  languages: string[];

  @Expose()
  @Transform(({ obj }) => obj.institutions || [])
  institutions: {
    name: string;
    degreeType: string;
    yearStarted: number;
    yearEnded: number;
  }[];

  @Expose()
  @Transform(({ obj }) => obj.introductoryVideo || null)
  introductoryVideo?: string;

  @Expose()
  @Transform(({ obj }) => obj.profilePicture || null)
  profilePicture?: string;

  @Expose()
  @Transform(({ obj }) => obj.weeklyAvailability || {})
  weeklyAvailability: WeeklyAvailability;

  @Expose()
  @Transform(({ obj }) => obj.offeredServices || [])
  offeredServices: string[];

  static fromEntity(user: User, portfolio: Portfolio): TutorProfileDto {
    const dto = new TutorProfileDto();
    dto.id = portfolio.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.rating = portfolio.rating || 0;
    dto.totalStudents = portfolio.totalStudents || 0;
    dto.totalLessons = portfolio.totalLessons || 0;
    dto.attendanceRate = portfolio.attendanceRate || 0;
    dto.responseRate = portfolio.responseRate || 0;
    dto.personalStatement = portfolio.personalStatement || '';
    dto.languages = portfolio.languages?.value || [];
    dto.institutions = portfolio.institutions || [];
    dto.introductoryVideo = portfolio.introductoryVideo || null;
    dto.profilePicture = user.profilePicture || null;
    dto.weeklyAvailability = portfolio.weeklyAvailability || {};
    dto.offeredServices = portfolio.sessionType || [];
    return dto;
  }
}
