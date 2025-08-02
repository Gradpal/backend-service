import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassSession } from '../session-package/class-session/entities/class-session.entity';
import { Repository } from 'typeorm';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { User } from '../user/entities/user.entity';
import { StudentScheduleAndCreditsResponseDTO } from './dto/schedule-credits.dto';
import {
  AchievementSummaryResponseDTO,
  BadgeResponseDto,
  CertificateResponseDTO,
} from './dto/achievement.dto';
import { TimeRangeDTO } from '@core-service/common/dtos/all.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly sessionRepo: Repository<ClassSession>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}
  async getStudentScheduleAndCredits(
    studentId: string,
  ): Promise<StudentScheduleAndCreditsResponseDTO> {
    const student = await this.userRepo.findOne({
      where: {
        id: studentId,
      },
    });
    const credits = student.credits;
    const schedules = await this.sessionRepo.find({
      where: {
        sessionPackage: {
          student: {
            id: student.id,
          },
        },
      },
      relations: [
        'sessionPackage',
        'sessionPackage.student',
        'sessionPackage.tutor',
        'timeSlot',
        'timeSlot.daySchedule',
        'timeSlot.weeklyAvailability',
        'timeSlot.owner',
        'subject',
      ],
      select: {
        id: true,
        status: true,
        subject: {
          name: true,
        },
        timeSlot: {
          startTime: true,
          endTime: true,
          owner: {
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
          daySchedule: {
            day: true,
            weeklyAvailability: {
              timezone: true,
            },
          },
        },
      },
    });

    // constant streaks
    const currentStreaks = '14 days';
    const bestStreak = '25 days';
    return {
      currentStreaks,
      bestStreak,
      schedules: schedules,
      credits,
    };
  }
  async getStudentAchievements(
    studentId: string,
    timeRange?: TimeRangeDTO,
  ): Promise<AchievementSummaryResponseDTO> {
    const { startDate, endDate } = timeRange || {};

    const filterByTime = (itemDate: string) => {
      const date = new Date(itemDate);
      if (startDate && new Date(startDate) > date) return false;
      if (endDate && new Date(endDate) < date) return false;
      return true;
    };

    const certificates = this.certificates.filter(
      (certificate) =>
        certificate.studentId === studentId &&
        filterByTime(certificate.issuedDate),
    );

    const badges = this.badges.filter(
      (badge) =>
        badge.studentId === studentId && filterByTime(badge.issuedDate),
    );

    const points = 850;
    const levelsUps = 12;

    return {
      badgesList: badges,
      certificatesTotal: certificates.length,
      badges: badges.length,
      points,
      levelsUps,
      certificates,
    };
  }

  //TODO: remove constant data when  some are added
  certificates: CertificateResponseDTO[] = [
    {
      id: 'a3f1e9d2-7c8b-4d95-b7e1-62f9e3c7a4e1',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      teacherId: 'e7d7a8c9-1a3b-4c4d-9c8b-235d90b2c4f7',
      subjectId: '9b2e13c7-7f3b-4f27-8b2d-88a13e5f1d2a',
      title: 'Mathematical Fundamentals',
      issuedDate: '2025-04-10',
      url: 'uploads/mathematical-fundamentals.pdf',
    },
    {
      id: 'f7b57e34-1f1e-4e2d-9c7a-4f5b8d30e1a2',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      teacherId: 'a9d6f4b8-5c8f-4d1f-bb2a-11fa9bc0d9d8',
      subjectId: 'af5e2872-4d73-4a27-a7ea-7fcb7746e865',
      title: 'Advanced Physics',
      issuedDate: '2025-05-15',
      url: 'uploads/advanced-physics.pdf',
    },
    {
      id: 'b8c1d8f6-c9e0-41f8-9373-0a56e8e0a0a3',
      studentId: 'b9b1e7c6-3f6e-4c75-910e-3c1a2ef23d8d',
      teacherId: 'e7d7a8c9-1a3b-4c4d-9c8b-235d90b2c4f7',
      subjectId: '9b2e13c7-7f3b-4f27-8b2d-88a13e5f1d2a',
      title: 'English Literature',
      issuedDate: '2025-06-22',
      url: 'uploads/english-literature.pdf',
    },
    {
      id: 'd46f2e98-4cbb-4f02-85d1-f47a2e21c762',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      teacherId: 'c4d2f9a2-6e5b-4dfc-91f3-2308b2a33e99',
      subjectId: 'daf45e67-8b7c-4331-9e20-61c8a94e2fbc',
      title: 'Computer Science Basics',
      issuedDate: '2025-02-28',
      url: 'uploads/cs-basics.pdf',
    },
    {
      id: 'ea72b8f1-9e15-4f96-9a15-5ed8c8e3f7d4',
      studentId: 'b9b1e7c6-3f6e-4c75-910e-3c1a2ef23d8d',
      teacherId: 'a9d6f4b8-5c8f-4d1f-bb2a-11fa9bc0d9d8',
      subjectId: 'fbc123a9-2c44-4b53-9ecf-4426c6e0ee3a',
      title: 'Introduction to Chemistry',
      issuedDate: '2025-03-05',
      url: 'uploads/intro-chemistry.pdf',
    },
  ];
  badges: BadgeResponseDto[] = [
    {
      id: '9f1c8e40-1d2a-4a2f-8a2b-1e4f3d5a6b7c',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Math Whiz',
      description: 'Awarded for scoring above 90% in Mathematics final exam.',
      issuedDate: '2025-07-10',
      iconUrl: 'uploads/badges/math-whiz.png',
    },
    {
      id: '4b7a1d9f-cf32-4cbe-8426-0e8e6a3b2d9f',
      studentId: 'b9b1e7c6-3f6e-4c75-910e-3c1a2ef23d8d',
      title: 'Science Explorer',
      description:
        'Recognized for outstanding participation in science projects.',
      issuedDate: '2025-06-22',
      iconUrl: 'uploads/badges/science-explorer.png',
    },
    {
      id: '6d9e5f21-8d40-44c3-90e3-3a1c9e4b4f8d',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Coding Beginner',
      description: 'Completed the beginner coding course successfully.',
      issuedDate: '2025-05-05',
      iconUrl: 'uploads/badges/coding-beginner.png',
    },
    {
      id: 'e2a7a683-7109-41e0-bd27-78b2a5c10c8e',
      studentId: 'd3f6c1a8-e5b4-4a09-8f1c-5d4f7b8a1e9c',
      title: 'Creative Writer',
      description: 'Awarded for excellent creative writing skills.',
      issuedDate: '2025-07-15',
      iconUrl: 'uploads/badges/creative-writer.png',
    },
    {
      id: 'a1c9e3f4-2b8e-4c71-b1b9-9c2d8f7a4e6d',
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'History Buff',
      description: 'Recognized for exceptional knowledge in history quizzes.',
      issuedDate: '2025-06-30',
      iconUrl: 'uploads/badges/history-buff.png',
    },
  ];
}
