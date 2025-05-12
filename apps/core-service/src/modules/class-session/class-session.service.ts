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
} from './enums/session-status.enum';
import { MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { SubjectTierService } from '../subjects/subject-tier/subject-tier.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { _400, _403 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { EUserRole } from '../user/enums/user-role.enum';
import { CancelLessonDto } from './dto/cancel-lesson.dto';
import { RequestSessionExtensionDto } from './dto/request-extion.dto';
import { TimeSlotService } from '../portfolio/weekly-availability/time-slot-service';
@Injectable()
export class ClassSessionService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly userService: UserService,
    private readonly subjectTierService: SubjectTierService,
    private readonly minioService: MinioClientService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly timeSlotService: TimeSlotService,
  ) {}

  async create(
    student: User,
    createClassSessionDto: CreateClassSessionDto,
    files: Express.Multer.File[],
  ): Promise<ClassSession> {
    const { tutorId, ...sessionData } = createClassSessionDto;

    const tutor = await this.userService.findOne(tutorId);
    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }
    const subjectTier =
      await this.subjectTierService.findSubjectTierWhichHasSubjectByTutorId(
        tutor.id,
        sessionData.subjectId,
      );

    if (!subjectTier) {
      throw new NotFoundException('No Subject Tier Found');
    }

    const attachments = await this.minioService.uploadAttachments(files, []);

    const session = this.classSessionRepository.create({
      ...sessionData,
      tutor,
      student,
      status: ESessionStatus.SCHEDULED,
      subject: { id: sessionData.subjectId },
      price: subjectTier.credits,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      attachments: attachments,
    });
    student.credits -= subjectTier.credits;

    const [updatedStudent, savedSession] = await Promise.all([
      this.userService.save(student),
      this.classSessionRepository.save(session),
    ]);
    return savedSession;
  }

  async findAll(): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      relations: ['tutor', 'student'],
    });
  }

  async findOne(id: string): Promise<ClassSession> {
    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations: ['tutor', 'student'],
    });

    if (!session) {
      throw new NotFoundException(`Class session with ID ${id} not found`);
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
      relations: ['tutor', 'student'],
    });
  }

  async findByStudent(studentId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { student: { id: studentId } },
      relations: ['tutor', 'student'],
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

  async getTopUpcomingSessions(student: User): Promise<ClassSession[]> {
    const currentDate = new Date();

    return this.classSessionRepository.find({
      where: {
        student: {
          id: student.id,
        },
        startTime: MoreThanOrEqual(currentDate),
        status: ESessionStatus.SCHEDULED,
      },
      relations: ['tutor', 'student'],
      order: {
        startTime: 'ASC',
      },
      take: 3,
    });
  }
}
