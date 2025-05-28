import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from './entities/class-session.entity';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UserService } from '../user/user.service';
import {
  ESessionJoinStatus,
  ESessionStatus,
  ESessionAcceptanceStatus,
} from './enums/session-status.enum';
import { MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { SubjectTierService } from '../subjects/subject-tier/subject-tier.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { _400, _403, _404 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { EUserRole } from '../user/enums/user-role.enum';
import { CancelLessonDto } from './dto/cancel-lesson.dto';
import { RequestSessionExtensionDto } from './dto/request-extion.dto';
import { WeeklyAvailabilityService } from '../portfolio/weekly-availability/weekly-availability';
import { normalizeArray } from '@core-service/common/helpers/all.helpers';
import { generateUUID } from '@app/common/helpers/shared.helpers';
import { SessionTimelineType } from './enums/session-timeline-type.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
@Injectable()
export class ClassSessionService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly userService: UserService,
    private readonly subjectTierService: SubjectTierService,
    private readonly minioService: MinioClientService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly weeklyAvailabilityService: WeeklyAvailabilityService,
    private readonly configService: CoreServiceConfigService,
  ) {}

  async create(
    student: User,
    createClassSessionDto: CreateClassSessionDto,
    files: Express.Multer.File[],
  ): Promise<ClassSession> {
    const { tutorId, ...sessionData } = createClassSessionDto;

    const timeSlotIds = normalizeArray(createClassSessionDto.timeSlotIds);
    createClassSessionDto.urls = normalizeArray(createClassSessionDto.urls);

    const tutor = await this.userService.findOne(tutorId);
    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    const subjectTier =
      await this.subjectTierService.findSubjectTierWhichHasSubjectByTutorId(
        tutor.id,
        sessionData.subjectId,
      );

    if (!subjectTier) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_TIER_NOT_FOUND);
    }

    const attachments = await this.minioService.uploadAttachments(files, []);

    const timeslots = [];

    if (timeSlotIds.length > 0) {
      for (const timeSlotId of timeSlotIds) {
        console.log(timeSlotId);
        const timeSlot =
          await this.weeklyAvailabilityService.findOne(timeSlotId);
        timeslots.push(timeSlot);
      }
    }

    const createdAt = new Date();
    const updatedAt = createdAt;
    sessionData.id = generateUUID();
    sessionData.createdAt = new Date();
    sessionData.updatedAt = sessionData.createdAt;
    const session = this.classSessionRepository.create({
      ...sessionData,
      tutor,
      student,
      status: ESessionStatus.SCHEDULED,
      subject: { id: sessionData.subjectId },
      price: subjectTier.credits,
      attachments: attachments,
      timeSlots: timeslots,
      sessionTimelines: [
        {
          type: SessionTimelineType.REQUEST_SUBMITTED,
          description: 'Session request submitted',
          actor: student,
          createdAt: createdAt,
          updatedAt: updatedAt,
        },
        {
          type: SessionTimelineType.PAYMENT_PROCESSED,
          description: 'Payment processed',
          actor: student,
          createdAt: createdAt,
          updatedAt: updatedAt,
        },
      ],
      goalDescription: sessionData.description,
    });

    student.credits -= subjectTier.credits;
    console.log('Session before save', session);

    const meetId = generateUUID();
    const sessionMeetLink = `${this.configService.getMeetHost()}/join/?sessionId=${session.id}&meetId=${meetId}`;
    session.meetLink = sessionMeetLink;
    const [updatedStudent, savedSession] = await Promise.all([
      this.userService.save(student),
      this.classSessionRepository.save(session),
    ]);
    return savedSession;
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

  async findOne(id: string): Promise<ClassSession> {
    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations: [
        'tutor',
        'student',
        'tutor.portfolio',
        'student.portfolio',
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
    if (session.student.id !== user.id && session.tutor.id !== user.id) {
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
      where: { id: sessionId, tutor: { id: tutorId } },
      relations: [
        'tutor',
        'student',
        'subject',
        'tutor.portfolio',
        'student.portfolio',
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
    if (session.student.id !== user.id && session.tutor.id !== user.id) {
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
    if (session.tutor.id !== user.id) {
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
    if (session.tutor.id !== user.id) {
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
    updateData: Partial<CreateClassSessionDto>,
  ): Promise<ClassSession> {
    const session = await this.findOne(id);

    if (updateData.tutorId) {
      const tutor = await this.userService.findOne(updateData.tutorId);
      if (!tutor) {
        throw new NotFoundException('Tutor not found');
      }
      session.tutor = tutor;
    }

    if (student.id !== session.student.id) {
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
      where: { tutor: { id: tutorId } },
      relations: [
        'tutor',
        'student',
        'tutor.portfolio',
        'student.portfolio',
        'subject',
      ],
    });
  }

  async findByStudent(studentId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { student: { id: studentId } },
      relations: [
        'tutor',
        'student',
        'tutor.portfolio',
        'student.portfolio',
        'subject',
      ],
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

  async requestSessionExtension(
    sessionId: string,
    user: User,
    requestSessionExtensionDto: RequestSessionExtensionDto,
  ): Promise<ClassSession> {
    const session: ClassSession = await this.findOne(sessionId);
    if (session.tutor.id !== user.id) {
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
    if (session.tutor.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_403.SESSION_NOT_YOURS);
    }
    if (session.status != ESessionStatus.IN_PROGRESS) {
      this.exceptionHandler.throwBadRequest(_400.SESSION_NOT_IN_PROGRESS);
    }
    if (accept) {
      session.status = ESessionStatus.EXTENDED;
      const extensionTime = session.extensionTime;
      session.extensionTime = null;
      session.endTime = new Date(
        session.endTime.getTime() + extensionTime.getTime(),
      );
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
          student: {
            id: user.id,
          },
          status: ESessionStatus.SCHEDULED,
          startTime: MoreThanOrEqual(currentDate),
        },
        {
          tutor: {
            id: user.id,
          },
          status: ESessionStatus.SCHEDULED,
          startTime: MoreThanOrEqual(currentDate),
        },
      ],
      relations: [
        'tutor',
        'student',
        'tutor.portfolio',
        'student.portfolio',
        'subject',
      ],
      order: {
        startTime: 'ASC',
      },
      take: 3,
    });
  }
}
