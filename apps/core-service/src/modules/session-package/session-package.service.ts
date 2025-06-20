import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionPackage } from './entities/session-package.entity';
import { MEETING_CACHE } from '@core-service/common/constants/brain.constants';
import { generateUUID } from '@app/common/helpers/shared.helpers';
import { SessionTimelineType } from '../class-session/enums/session-timeline-type.enum';
import { ClassSessionService } from '../class-session/class-session.service';
import { User } from '../user/entities/user.entity';
import { normalizeArray } from '@core-service/common/helpers/all.helpers';
import { UserService } from '../user/user.service';
import { _400, _404 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ClassSession } from '../class-session/entities/class-session.entity';
import { BrainService } from '@app/common/brain/brain.service';
import { SubjectTierService } from '../subjects/subject-tier/subject-tier.service';
import { ESessionStatus } from '../class-session/enums/session-status.enum';
import { WeeklyAvailabilityService } from '../portfolio/weekly-availability/weekly-availability';
import { MinioClientService } from '../minio-client/minio-client.service';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { PackageType } from './entities/package-type.entity';
import {
  CreateClassSessionPackageDto,
  CreatePackageTypeDto,
} from './dto/create-session-package.dto';

@Injectable()
export class SessionPackageService {
  constructor(
    @InjectRepository(SessionPackage)
    private readonly sessionPackageRepository: Repository<SessionPackage>,
    @InjectRepository(PackageType)
    private readonly packageTypeRepository: Repository<PackageType>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly classSessionService: ClassSessionService,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly subjectTierService: SubjectTierService,
    private readonly weeklyAvailabilityService: WeeklyAvailabilityService,

    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
    private readonly coreServiceConfigService: CoreServiceConfigService,
  ) {}

  async getSessionPackageRepository() {
    return this.sessionPackageRepository;
  }

  async create(
    student: User,
    createClassSessionPackageDto: CreateClassSessionPackageDto,
  ): Promise<SessionPackage> {
    const packageType = await this.findOnePackageType(
      createClassSessionPackageDto.packageTypeId,
    );
    const sessionPackage = this.sessionPackageRepository.create({
      sessionPackageType: packageType,
    });
    const sessions = [];

    const { ...sessionData } = createClassSessionPackageDto;

    const timeSlotIds = normalizeArray(
      createClassSessionPackageDto.timeSlotIds,
    );
    const timeslots = [];

    if (timeSlotIds.length > 0) {
      for (const timeSlotId of timeSlotIds) {
        const timeSlot =
          await this.weeklyAvailabilityService.findOne(timeSlotId);
        timeslots.push(timeSlot);
      }
    }

    const createdAt = new Date();
    const updatedAt = createdAt;

    for (const timeSlot of timeslots) {
      const subjectTier =
        await this.subjectTierService.findSubjectTierWhichHasSubjectByTutorId(
          timeSlot.owner.id,
          sessionData.subjectId,
        );
      // Price calculation
      const price =
        (subjectTier.credits *
          createClassSessionPackageDto.sessionLength *
          packageType.discount) /
        100;

      const session = this.classSessionRepository.create({
        ...sessionData,
        tutor: timeSlot.owner,
        student,
        status: ESessionStatus.SCHEDULED,
        subject: { id: sessionData.subjectId },
        price: price,
        timeSlot: timeSlot,
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
      });
      sessions.push(session);

      student.credits -= subjectTier.credits;

      const meetId = generateUUID();
      const sessionMeetLink = `${this.coreServiceConfigService.getMeetHost()}/join?sessionId=${session.id}&meetId=${meetId}`;
      const key = `${MEETING_CACHE.name}:${session.id}`;
      await this.brainService.memorize(key, meetId);

      session.meetLink = sessionMeetLink;
      await Promise.all([
        this.userService.save(student),
        this.classSessionRepository.save(session),
      ]);
    }
    sessionPackage.classSessions = sessions;
    return this.sessionPackageRepository.save(sessionPackage);
  }

  // Session Package Type CRUD
  async createPackageType(createPackageTypeDto: CreatePackageTypeDto) {
    const packageTypeExists = await this.packageTypeExistsByMaximumSessions(
      createPackageTypeDto.maximumSessions,
    );
    if (packageTypeExists) {
      this.exceptionHandler.throwBadRequest(_400.PACKAGE_TYPE_ALREADY_EXISTS);
    }
    const packageType = this.packageTypeRepository.create(createPackageTypeDto);
    return this.packageTypeRepository.save(packageType);
  }
  async packageTypeExistsByMaximumSessions(maximumSessions: number) {
    const sessionPackage = await this.packageTypeRepository.findOne({
      where: { maximumSessions },
    });
    return !!sessionPackage;
  }

  async findAllPackageTypes() {
    return this.packageTypeRepository.find();
  }

  async findOnePackageType(id: string) {
    const packageType = await this.packageTypeRepository.findOne({
      where: { id },
    });
    if (!packageType) {
      this.exceptionHandler.throwNotFound(_404.PACKAGE_TYPE_NOT_FOUND);
    }
    return packageType;
  }
}
