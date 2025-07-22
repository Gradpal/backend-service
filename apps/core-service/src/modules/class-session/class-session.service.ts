import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ClassSession } from './entities/class-session.entity';
import { UserService } from '../user/user.service';
import {
  ESessionJoinStatus,
  ESessionStatus,
  ESessionAcceptanceStatus,
} from './enums/session-status.enum';
import { User } from '../user/entities/user.entity';
import { _400, _403, _404 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { EUserRole } from '../user/enums/user-role.enum';
import { CancelLessonDto } from './dto/cancel-lesson.dto';
import { RequestSessionExtensionDto } from './dto/request-extion.dto';
import { SessionTimelineType } from './enums/session-timeline-type.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { SessionReviewDto } from './dto/session-review.dto';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TimeSlot } from '../portfolio/weekly-availability/entities/weeky-availability.entity';
import { timeStringToNextDate } from './helpers';
import { CreateClassSessionPackageDto } from './dto/create-class-session.dto';
import {
  SessionDashboardDataDTO,
  SessionResponseDTO,
} from './dto/session-dashboard-data.dto';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { TimeRangeDTO } from '@core-service/common/dtos/all.dto';
dayjs.extend(duration);
@Injectable()
export class ClassSessionService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  async getClassSessionRepository() {
    return this.classSessionRepository;
  }

  async validateMeetingLink(sessionId: string, meetId: string) {
    const session: ClassSession = await this.findOne(sessionId);
    // const isMeetingValid = await this.brainService.verifyMeetingId(
    //   sessionId,
    //   meetId,
    // );
    if (!session) {
      return {
        isValid: false,
      };
    }
    return {
      sessionTitle: `Session with ${session.sessionPackage?.tutor?.firstName ?? session.sessionPackage?.tutor?.lastName} about ${session.subject?.name}`,
      isValid: true,
    };
  }

  async findSessionsForLoggedInUser(
    sessionStatus?: string,
    searchKeyword?: string,
    loggedInUser?: User,
    page?: number,
    limit?: number,
  ) {
    const classSessionQuery = this.classSessionRepository
      .createQueryBuilder('classSession')
      .leftJoinAndSelect('classSession.tutor', 'tutor')
      .leftJoinAndSelect('classSession.student', 'student')
      .leftJoinAndSelect('classSession.subject', 'subject');

    if (sessionStatus) {
      classSessionQuery.andWhere(
        '(classSession.status = :status OR classSession.joinStatus = :status OR classSession.acceptanceStatus = :status)',
        {
          status: sessionStatus,
        },
      );
    }

    if (searchKeyword) {
      classSessionQuery.andWhere(
        'classSession.description  LIKE :keyword OR tutor.name LIKE :keyword OR student.name LIKE :keyword OR subject.name LIKE :keyword OR tutor.email LIKE :keyword OR student.email LIKE :keyword',
        {
          keyword: `%${searchKeyword}%`,
        },
      );
    }
    classSessionQuery.andWhere(
      '(classSession.tutor.id = :userId OR classSession.student.id = :userId)',
      {
        userId: loggedInUser.id,
      },
    );
    classSessionQuery.skip((page - 1) * limit).take(limit);

    const [sessions, total] = await classSessionQuery.getManyAndCount();
    return createPaginatedResponse(sessions, total, page, limit);
  }

  calculateSessionStartTimeAndEndTimeBasedOnTimeSlots(timeSlots: TimeSlot[]) {
    const startTime = timeSlots[0].startTime;
    const startDay =
      timeSlots[timeSlots.length - 1]?.daySchedule?.day ?? 'Monday';

    const endTime = timeSlots[timeSlots.length - 1].endTime;
    const endDay =
      timeSlots[timeSlots.length - 1]?.daySchedule?.day ?? 'Monday';

    return {
      startTime: timeStringToNextDate(`${startDay}:${startTime}`).toISOString(),
      endTime: timeStringToNextDate(`${endDay}:${endTime}`).toISOString(),
    };
  }

  async findOne(id: string): Promise<ClassSession> {
    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations: [
        'sessionPackage',
        'sessionPackage.tutor',
        'sessionPackage.student',
        'sessionPackage.tutor.portfolio',
        'sessionPackage.student.portfolio',
        'subject',
      ],
    });

    if (!session) {
      this.exceptionHandler.throwNotFound(_404.CLASS_SESSION_NOT_FOUND);
    }
    return session;
  }

  async joinSession(sessionId: string, user: User): Promise<ClassSession> {
    const session = await this.findOne(sessionId);
    if (session.status == ESessionStatus.CANCELLED) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_CANCELLED);
    }
    if (session.status == ESessionStatus.POSTPONED) {
      this.exceptionHandler.throwBadRequest(_400.POSTPONED_SESSION);
    }
    if (session.status == ESessionStatus.COMPLETED) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_COMPLETED);
    }
    if (
      session.sessionPackage.student.id !== user.id &&
      session.sessionPackage.tutor.id !== user.id
    ) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    const isUserTutor = user.role == EUserRole.TUTOR;
    const isUserStudent = user.role == EUserRole.STUDENT;

    if (
      session.joinStatus == ESessionJoinStatus.TUTOR_JOINED &&
      isUserStudent
    ) {
      session.joinStatus = ESessionJoinStatus.BOTH_JOINED;
      session.status = ESessionStatus.IN_PROGRESS;
    } else if (
      session.joinStatus == ESessionJoinStatus.STUDENT_JOINED &&
      isUserTutor
    ) {
      session.joinStatus = ESessionJoinStatus.BOTH_JOINED;
      session.status = ESessionStatus.IN_PROGRESS;
    } else {
      session.joinStatus = isUserStudent
        ? ESessionJoinStatus.STUDENT_JOINED
        : ESessionJoinStatus.TUTOR_JOINED;
    }
    return this.classSessionRepository.save(session);
  }

  async findOneByIdAndTutor(
    sessionId: string,
    tutorId: string,
  ): Promise<ClassSession> {
    return this.classSessionRepository.findOne({
      where: { id: sessionId, sessionPackage: { tutor: { id: tutorId } } },
      relations: [
        'sessionPackage',
        'sessionPackage.tutor',
        'sessionPackage.student',
        'subject',
        'sessionPackage.tutor.portfolio',
        'sessionPackage.student.portfolio',
      ],
    });
  }
  async acceptSession(sessionId: string, user: User): Promise<ClassSession> {
    const createdAt = new Date();
    const updatedAt = createdAt;
    const session = await this.findOneByIdAndTutor(sessionId, user.id);
    if (!session) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    session.acceptanceStatus = ESessionAcceptanceStatus.ACCEPTED;
    const sessionTimelines = session.sessionTimelines || [];
    sessionTimelines.push({
      type: SessionTimelineType.REQUEST_ACCEPTED,
      description: 'Session request accepted',
      actor: user,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
    session.sessionTimelines = sessionTimelines;
    return this.classSessionRepository.save(session);
  }

  async leaveSession(sessionId: string, user: User): Promise<ClassSession> {
    const session = await this.findOne(sessionId);
    if (
      session.sessionPackage.student.id !== user.id &&
      session.sessionPackage.tutor.id !== user.id
    ) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    if (session.joinStatus == ESessionJoinStatus.NONE_JOINED) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_NOT_JOINED);
    }
    const isUserTutor = user.role == EUserRole.TUTOR;
    const isUserStudent = user.role == EUserRole.STUDENT;

    if (session.joinStatus == ESessionJoinStatus.BOTH_JOINED && isUserTutor) {
      session.joinStatus = ESessionJoinStatus.TUTOR_LEFT;
    } else if (
      session.joinStatus == ESessionJoinStatus.BOTH_JOINED &&
      isUserStudent
    ) {
      session.joinStatus = ESessionJoinStatus.STUDENT_LEFT;
    } else {
      session.joinStatus = ESessionJoinStatus.NONE_JOINED;
    }
    return this.classSessionRepository.save(session);
  }
  async postponeSession(sessionId: string, user: User): Promise<ClassSession> {
    const session = await this.findOne(sessionId);
    if (session.sessionPackage.tutor.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    session.status = ESessionStatus.POSTPONED;
    return this.classSessionRepository.save(session);
  }

  async cancelSession(
    sessionId: string,
    user: User,
    cancelLessonDto: CancelLessonDto,
  ): Promise<ClassSession> {
    const session = await this.findOne(sessionId);
    if (session.sessionPackage.tutor.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    if (session.status != ESessionStatus.SCHEDULED) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_NOT_SCHEDULED);
    }
    session.status = ESessionStatus.CANCELLED;
    session.cancelationReason = cancelLessonDto.reason;
    return this.classSessionRepository.save(session);
  }
  async update(
    student: User,
    id: string,
    updateData: Partial<CreateClassSessionPackageDto>,
  ): Promise<ClassSession> {
    const session = await this.findOne(id);

    if (updateData.tutorId) {
      const tutor = await this.userService.findOne(updateData.tutorId);
      if (!tutor) {
        throw new NotFoundException('Tutor not found');
      }
      session.sessionPackage.tutor = tutor;
    }

    if (student.id !== session.sessionPackage.student.id) {
      throw new ForbiddenException(
        'You are not allowed to update this session',
      );
    }

    Object.assign(session, updateData);
    return this.classSessionRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.classSessionRepository.remove(session);
  }

  async findByTutor(tutorId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { sessionPackage: { tutor: { id: tutorId } } },
      relations: [
        'sessionPackage',
        'sessionPackage.tutor',
        'sessionPackage.student',
        'sessionPackage.tutor.portfolio',
        'sessionPackage.student.portfolio',
        'subject',
      ],
    });
  }

  async findByStudent(studentId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { sessionPackage: { student: { id: studentId } } },
      relations: [
        'sessionPackage',
        'timeSlot',
        'timeSlot.daySchedule',
        'timeSlot.daySchedule.weeklyAvailability',
        'sessionPackage.tutor',
        'sessionPackage.student',
        'sessionPackage.tutor.portfolio',
        'sessionPackage.student.portfolio',
        'subject',
      ],
    });
  }

  async findByChild(studentId: string, parent: User): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: {
        sessionPackage: {
          student: {
            id: studentId,
            parent: {
              id: parent.id,
            },
          },
        },
      },
      relations: [
        'sessionPackage',
        'timeSlot',
        'timeSlot.daySchedule',
        'timeSlot.daySchedule.weeklyAvailability',
        'sessionPackage.tutor',
        'sessionPackage.student',
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
  }

  async updateStatus(
    id: string,
    status: ESessionStatus,
  ): Promise<ClassSession> {
    const session = await this.findOne(id);
    session.status = status;
    return this.classSessionRepository.save(session);
  }
  async reviewSession(
    sessionId: string,
    user: User,
    reviewSessionDto: SessionReviewDto,
  ): Promise<ClassSession> {
    const session: ClassSession = await this.findOne(sessionId);
    session.sessionReview = reviewSessionDto;
    session.isConfirmed = true;
    const tutorPortfolio = session.sessionPackage.tutor.portfolio;

    tutorPortfolio.rating = reviewSessionDto.rating;
    const portfolioReviews = tutorPortfolio.reviews || [];
    portfolioReviews.push(reviewSessionDto);
    tutorPortfolio.reviews = portfolioReviews;
    const [updatedTutorProfile, updatedSession] = await Promise.all([
      this.portfolioService.getPortfolioRepository().save(tutorPortfolio),
      this.classSessionRepository.save(session),
    ]);
    return updatedSession;
  }

  async requestSessionExtension(
    sessionId: string,
    user: User,
    requestSessionExtensionDto: RequestSessionExtensionDto,
  ): Promise<ClassSession> {
    const session: ClassSession = await this.findOne(sessionId);
    if (session.sessionPackage.tutor.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    if (session.status != ESessionStatus.IN_PROGRESS) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_NOT_IN_PROGRESS);
    }
    session.extensionTime = requestSessionExtensionDto.newEndTime;
    return this.classSessionRepository.save(session);
  }

  async acceptOrRejectSessionExtension(
    sessionId: string,
    user: User,
    accept: boolean,
  ): Promise<ClassSession> {
    const session: ClassSession = await this.findOne(sessionId);
    if (session.sessionPackage.tutor.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    if (session.status != ESessionStatus.IN_PROGRESS) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_NOT_IN_PROGRESS);
    }
    if (accept) {
      session.status = ESessionStatus.EXTENDED;
      const extensionTime = session.extensionTime;
      session.extensionTime = null;
      session.timeSlot.endTime = timeStringToNextDate(
        session.timeSlot.endTime,
      ).toISOString();
    } else {
      session.extensionTime = null;
    }
    return this.classSessionRepository.save(session);
  }

  async getTopUpcomingSessions(user: User): Promise<ClassSession[]> {
    const currentDate = new Date();

    return this.classSessionRepository.find({
      where: [
        {
          sessionPackage: {
            student: {
              id: user.id,
            },
          },
          status: ESessionStatus.SCHEDULED,
        },
        {
          sessionPackage: {
            tutor: {
              id: user.id,
            },
          },
          status: ESessionStatus.SCHEDULED,
        },
      ],
      relations: [
        'sessionPackage',
        'sessionPackage.tutor',
        'sessionPackage.student',
        'sessionPackage.tutor.portfolio',
        'sessionPackage.student.portfolio',
        'subject',
      ],
      order: {
        timeSlot: {
          startTime: 'ASC',
        },
      },
      take: 3,
    });
  }
  async getSessionDashboardData(
    studentId: string,
    timeRange?: TimeRangeDTO,
  ): Promise<SessionDashboardDataDTO> {
    try {
      const completedWhere: FindOptionsWhere<ClassSession> = {
        status: ESessionStatus.COMPLETED,
        sessionPackage: {
          student: { id: studentId },
        },
      };

      if (timeRange?.startDate && timeRange?.endDate) {
        completedWhere.createdAt = Between(
          new Date(timeRange.startDate),
          new Date(timeRange.endDate),
        );
      } else if (timeRange?.startDate) {
        completedWhere.createdAt = MoreThanOrEqual(
          new Date(timeRange.startDate),
        );
      } else if (timeRange?.endDate) {
        completedWhere.createdAt = LessThanOrEqual(new Date(timeRange.endDate));
      }

      const [completedSessions, recentSessions] = await Promise.all([
        this.classSessionRepository.find({
          where: completedWhere,
          relations: ['sessionPackage', 'sessionPackage.student'],
        }),
        this.classSessionRepository.find({
          where: {
            sessionPackage: {
              student: {
                id: studentId,
              },
            },
          },
          relations: ['sessionPackage', 'sessionPackage.student'],
          order: {
            createdAt: 'DESC',
          },
          take: 5,
        }),
      ]);
      const recentDtos: SessionResponseDTO[] = recentSessions.map((session) => {
        const { durationStr } = this.getDuration(
          session.timeSlot?.startTime,
          session.timeSlot?.endTime,
        );
        return {
          id: session.id,
          subjectName: session.subject?.name,
          startTime: session.timeSlot?.startTime,
          endTime: session.timeSlot?.endTime,
          duration: durationStr,
        };
      });
      const totalMinutes = completedSessions.reduce((sum, session) => {
        if (!session.timeSlot?.startTime || !session.timeSlot?.endTime)
          return sum;
        const { minutes } = this.getDuration(
          session.timeSlot.startTime,
          session.timeSlot.endTime,
        );
        return sum + minutes;
      }, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const totalHours = `${hours}h ${minutes}m`;

      // get feedbacks
      const feedbacks = completedSessions
        .filter((session) => session.sessionReview)
        .map((session) => {
          const review = session.sessionReview;
          return {
            sessionId: session.id,
            subjectName: session.subject?.name,
            review: review.review,
            rating: review.rating,
            reviewedAt: session.updatedAt,
            teacher: {
              id: session.sessionPackage?.tutor?.id,
              firstName: session.sessionPackage?.tutor?.firstName,
              lastName: session.sessionPackage?.tutor?.lastName,
            },
          };
        });
      return {
        timeManagement: Math.floor(Math.random() * 101),
        attendanceRate: Math.floor(Math.random() * 101),
        feedbacks,
        totalHours,
        completedSessions: completedSessions.length,
        recentSessions: recentDtos,
      };
    } catch (error) {
      throw this.exceptionHandler.throwInternalServerError(error);
    }
  }
  getDuration = (
    start: string,
    end: string,
  ): { durationStr: string; minutes: number } => {
    const s = dayjs(`2000-01-01T${start}`);
    const e = dayjs(`2000-01-01T${end}`);
    const diff = dayjs.duration(e.diff(s));
    return {
      durationStr: `${diff.hours()}h ${diff.minutes()}m`,
      minutes: diff.asMinutes(),
    };
  };
}
