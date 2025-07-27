import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { SessionPackage } from './entities/session-package.entity';
import { MEETING_CACHE } from '@core-service/common/constants/brain.constants';
import { generateUUID } from '@app/common/helpers/shared.helpers';
import { SessionTimelineType } from '../class-session/enums/session-timeline-type.enum';
import { User } from '../user/entities/user.entity';
import { normalizeArray } from '@core-service/common/helpers/all.helpers';
import { UserService } from '../user/user.service';
import { _400, _404 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ClassSession } from '../class-session/entities/class-session.entity';
import { BrainService } from '@app/common/brain/brain.service';
import { SubjectTierService } from '../subjects/subject-tier/subject-tier.service';
import {
  ESessionAcceptanceStatus,
  ESessionStatus,
} from '../class-session/enums/session-status.enum';
import { WeeklyAvailabilityService } from '../portfolio/weekly-availability/weekly-availability';
import { MinioClientService } from '../minio-client/minio-client.service';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { PackageType } from './entities/package-type.entity';
import {
  CreateClassSessionPackageDto,
  CreatePackageTypeDto,
  AddSessionsDetailsDto,
  TimeSlotSessionDateDto,
} from './dto/create-session-package.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { AcceptPackageSessionDto } from '../finance/dtos/accept-package-session.dto';
import { PackageStatus } from './enums/paclage-status.enum';
import { PackageOffering } from './entities/package-offering.entity';
import { UpdatePackageDto } from './dto/update-session-package.dto';
import { TimeSlot } from '../portfolio/weekly-availability/entities/weeky-availability.entity';

@Injectable()
export class SessionPackageService {
  constructor(
    @InjectRepository(SessionPackage)
    private readonly sessionPackageRepository: Repository<SessionPackage>,
    @InjectRepository(PackageType)
    private readonly packageTypeRepository: Repository<PackageType>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(PackageOffering)
    private readonly packageOfferingRepository: Repository<PackageOffering>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @Inject(forwardRef(() => UserService))
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

  getPackageOfferingRepository() {
    return this.packageOfferingRepository;
  }

  async create(
    student: User,
    createClassSessionPackageDto: CreateClassSessionPackageDto,
  ) {
    const packageOffering = await this.getPackageOfferingRepository().findOne({
      where: { id: createClassSessionPackageDto.packageOfferingId },
      relations: ['packageType'],
    });

    if (!packageOffering) {
      this.exceptionHandler.throwNotFound(_404.PACKAGE_OFFERING_NOT_FOUND);
    }

    const timeSlotSessions = normalizeArray(
      createClassSessionPackageDto.timeSlots,
    ) as TimeSlotSessionDateDto[];

    if (!Array.isArray(timeSlotSessions) || timeSlotSessions.length === 0) {
      this.exceptionHandler.throwBadRequest(_400.INVALID_TIMESLOTS);
    }

    const createdAt = new Date();
    const updatedAt = createdAt;

    const sessions = [];

    const firstTimeSlot = await this.weeklyAvailabilityService.findOne(
      timeSlotSessions[0].timeSlotId,
    );
    if (!firstTimeSlot) {
      this.exceptionHandler.throwNotFound(_404.TIME_SLOT_NOT_FOUND);
    }

    const tutor = firstTimeSlot.owner;

    let sessionPackage = this.sessionPackageRepository.create({
      sessionPackageType: packageOffering.packageType,
      tutor: tutor,
      student: student,
    });
    sessionPackage = await this.sessionPackageRepository.save(sessionPackage);

    for (const {
      timeSlotId,
      sessionDate,
    } of timeSlotSessions as TimeSlotSessionDateDto[]) {
      const timeSlot = await this.weeklyAvailabilityService.findOne(timeSlotId);
      if (!timeSlot) {
        this.exceptionHandler.throwNotFound(_404.TIME_SLOT_NOT_FOUND);
      }

      if (timeSlot.isBooked) {
        this.exceptionHandler.throwBadRequest(_400.TIME_SLOT_ALREADY_BOOKED);
      }
      timeSlot.isBooked = true;
      await this.timeSlotRepository.save(timeSlot);

      const subjectTier =
        await this.subjectTierService.findSubjectTierWhichHasSubjectByTutorId(
          tutor.id,
          createClassSessionPackageDto.subjectId,
        );

      const sessionPrice =
        (subjectTier.credits *
          (createClassSessionPackageDto.sessionLength / 60) *
          packageOffering.discount) /
        100;

      if (student.credits < subjectTier.credits) {
        this.exceptionHandler.throwBadRequest(_400.INSUFFICIENT_CREDITS);
      }

      const session = this.classSessionRepository.create({
        ...createClassSessionPackageDto,
        status: ESessionStatus.SCHEDULED,
        subject: { id: createClassSessionPackageDto.subjectId },
        price: sessionPrice,
        timeSlot,
        sessionDate: sessionDate,
        sessionPackage,
        sessionTimelines: [
          {
            type: SessionTimelineType.REQUEST_SUBMITTED,
            description: 'Session request submitted',
            actor: student,
            createdAt,
            updatedAt,
          },
          {
            type: SessionTimelineType.PAYMENT_PROCESSED,
            description: 'Payment processed',
            actor: student,
            createdAt,
            updatedAt,
          },
        ],
      });

      student.credits -= subjectTier.credits;

      const savedSession = await this.classSessionRepository.save(session);

      const meetId = generateUUID();
      const sessionMeetLink = `${this.coreServiceConfigService.getMeetHost()}/join?sessionId=${savedSession.id}&meetId=${meetId}`;
      const cacheKey = `${MEETING_CACHE.name}:${savedSession.id}`;
      await this.brainService.memorize(cacheKey, meetId);

      savedSession.meetLink = sessionMeetLink;

      await Promise.all([
        this.userService.save(student),
        this.classSessionRepository.save(savedSession),
      ]);

      sessions.push(savedSession);
    }
    return await this.getSessionPackageById(sessionPackage.id);
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

  async findOneClassSession(id: string) {
    const classSession = await this.classSessionRepository.findOne({
      where: { id },
    });
    return classSession;
  }

  async getAvailablePackageTypes() {
    const packageTypes = await this.packageTypeRepository.find({
      order: { maximumSessions: 'ASC' },
    });
    return packageTypes;
  }

  async createPackageTypeIfNotExists(
    maximumSessions: number,
    description: string,
  ) {
    const existingPackageType = await this.packageTypeRepository.findOne({
      where: { maximumSessions },
    });

    if (existingPackageType) {
      return existingPackageType;
    }

    const packageType = this.packageTypeRepository.create({
      maximumSessions,
      description,
    });

    return await this.packageTypeRepository.save(packageType);
  }

  async addSessionDetailsToClassSession(
    classSessionId: string,
    addSessionsDetailsDto: AddSessionsDetailsDto,
    files: {
      supportingDocuments?: Express.Multer.File[];
    },
  ) {
    const classSession = await this.findOneClassSession(classSessionId);
    classSession.goalDescription = addSessionsDetailsDto.goalDescription;
    classSession.urls = normalizeArray(addSessionsDetailsDto.urls);
    const attachments = await this.minioService.uploadAttachments(
      { files: files.supportingDocuments },
      classSession.attachments,
    );
    classSession.attachments = attachments;
    classSession.notes = addSessionsDetailsDto.goalDescription;
    classSession.updatedAt = new Date();
    return this.classSessionRepository.save(classSession);
  }

  async findAllSessionPackagesLoggedInUserAndStatus(
    user: User,
    status: ESessionStatus,
    searchKeyword: string,
    page: number,
    limit: number,
  ) {
    const sessionPackages = await this.sessionPackageRepository.find({
      where: [
        { tutor: user, classSessions: { status: status } },
        { student: user, classSessions: { status: status } },
      ],
      relations: [
        'sessionPackageType',
        'tutor',
        'tutor.portfolio',
        'student',
        'student.portfolio',
        'classSessions',
        'classSessions.timeSlot',
        'classSessions.subject',
      ],
      select: {
        id: true,
        status: true,
        sessionPackageType: {
          id: true,
          maximumSessions: true,
        },
        tutor: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          role: true,
          portfolio: {
            id: true,
            university: true,
            isVerified: true,
          },
        },
        student: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          role: true,
          portfolio: {
            id: true,
            university: true,
            isVerified: true,
          },
        },
        classSessions: {
          id: true,
          status: true,
          joinStatus: true,
          acceptanceStatus: true,
          isConfirmed: true,
          meetLink: true,
          sessionReview: {
            rating: true,
            technicalIssuesEncountered: true,
            tutorCanbeRecommended: true,
            intendToWorkWithTutorAgain: true,
          },
          price: true,
        },
      },
    });
    const packagesIds = sessionPackages.map(
      (sessionPackage) => sessionPackage.id,
    );

    // If no packages found, return empty result
    if (packagesIds.length === 0) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const sessionPackageQuery = this.sessionPackageRepository
      .createQueryBuilder('SessionPackage')
      .leftJoinAndSelect(
        'SessionPackage.sessionPackageType',
        'sessionPackageType',
      )
      .leftJoinAndSelect('SessionPackage.classSessions', 'classSessions')
      .leftJoinAndSelect('SessionPackage.tutor', 'tutor')
      .leftJoinAndSelect('SessionPackage.student', 'student')
      .leftJoinAndSelect('tutor.portfolio', 'tutorPortfolio')
      .leftJoinAndSelect('classSessions.timeSlot', 'timeSlot')
      .leftJoinAndSelect('timeSlot.daySchedule', 'daySchedule')
      .leftJoinAndSelect('daySchedule.weeklyAvailability', 'weeklyAvailability')
      .leftJoinAndSelect('timeSlot.owner', 'owner')
      .leftJoinAndSelect('classSessions.subject', 'subject')
      .where('SessionPackage.id IN (:...packagesIds)', { packagesIds });

    if (status) {
      sessionPackageQuery.andWhere('SessionPackage.status = :status', {
        status,
      });
    }

    if (searchKeyword) {
      sessionPackageQuery.andWhere(
        'owner.firstName LIKE :searchKeyword OR owner.lastName LIKE :searchKeyword OR tutor.firstName LIKE :searchKeyword OR tutor.lastName LIKE :searchKeyword OR subject.name LIKE :searchKeyword',
        {
          searchKeyword: `%${searchKeyword}%`,
        },
      );
    }
    if (page && limit) {
      sessionPackageQuery.skip((page - 1) * limit).take(limit);
    }

    sessionPackageQuery.select([
      'SessionPackage.id',
      'SessionPackage.createdAt',
      'SessionPackage.status',
      'sessionPackageType.id',
      'sessionPackageType.maximumSessions',
      'tutor.id',
      'tutor.firstName',
      'tutor.lastName',
      'tutor.profilePicture',
      'tutor.email',
      'student.id',
      'student.firstName',
      'student.lastName',
      'student.profilePicture',
      'student.email',
      'tutor.role',
      'tutorPortfolio.id',
      'tutorPortfolio.university',
      'tutorPortfolio.isVerified',
      'classSessions.id',
      'classSessions.status',
      'classSessions.price',
    ]);
    const [sessionPackagesResponse, total] =
      await sessionPackageQuery.getManyAndCount();

    return createPaginatedResponse(sessionPackagesResponse, total, page, limit);
  }

  async getSessionPackageById(id: string) {
    return this.sessionPackageRepository.findOne({
      where: { id: id },
      relations: [
        'sessionPackageType',
        'tutor',
        'student',
        'classSessions',
        'classSessions.timeSlot',
        'classSessions.timeSlot.daySchedule',
        'classSessions.timeSlot.daySchedule.weeklyAvailability',
        'classSessions.timeSlot.owner',
        'classSessions.subject',
      ],
      select: {
        id: true,
        createdAt: true,
        status: true,
        sessionPackageType: {
          id: true,
          maximumSessions: true,
        },
        tutor: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
        student: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
        classSessions: {
          id: true,
          status: true,
          urls: true,
          joinStatus: true,
          acceptanceStatus: true,
          attachments: true,
          meetLink: true,

          sessionReview: {
            rating: true,
            technicalIssuesEncountered: true,
            tutorCanbeRecommended: true,
            intendToWorkWithTutorAgain: true,
          },
          sessionTimelines: {
            actor: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
            type: true,
          },
          goalDescription: true,
          timeSlot: {
            startTime: true,
            endTime: true,
            isBooked: true,
            daySchedule: {
              day: true,
              weeklyAvailability: {
                timezone: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllClassSessionByPackageIdAndLoggedInUserAndStatus(
    packageId: string,
    user: User,
    status: ESessionStatus,
  ) {
    return this.classSessionRepository.find({
      where: {
        status: status,
        sessionPackage: [
          {
            id: packageId,
            student: user,
          },
          {
            id: packageId,
            tutor: user,
          },
        ],
      },
      relations: [
        'timeSlot',
        'timeSlot.daySchedule',
        'timeSlot.daySchedule.weeklyAvailability',
      ],
      select: {
        id: true,
        status: true,
        joinStatus: true,
        acceptanceStatus: true,
        meetLink: true,

        sessionReview: {
          rating: true,
          technicalIssuesEncountered: true,
          tutorCanbeRecommended: true,
          intendToWorkWithTutorAgain: true,
        },
        timeSlot: {
          startTime: true,
          endTime: true,
          isBooked: true,
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

  async acceptPackageSessions(
    acceptPackageSessionDto: AcceptPackageSessionDto,
    sessionPackageId: string,
  ) {
    acceptPackageSessionDto.sessionIds = normalizeArray(
      acceptPackageSessionDto.sessionIds,
    );
    const sessionPackage = await this.sessionPackageRepository.findOne({
      where: { id: sessionPackageId },
    });
    await Promise.all([
      this.classSessionRepository.update(
        {
          id: In(acceptPackageSessionDto.sessionIds),
          sessionPackage: {
            id: sessionPackageId,
            status: PackageStatus.PENDING,
          },
        },
        {
          acceptanceStatus: ESessionAcceptanceStatus.ACCEPTED,
        },
      ),
      this.classSessionRepository.update(
        {
          id: Not(In(acceptPackageSessionDto.sessionIds)),
          sessionPackage: {
            id: sessionPackageId,
            status: PackageStatus.PENDING,
          },
        },
        {
          acceptanceStatus: ESessionAcceptanceStatus.REJECTED,
        },
      ),
    ]);

    sessionPackage.status = PackageStatus.ACCEPTED;
    await this.sessionPackageRepository.save(sessionPackage);

    return sessionPackage;
  }
  async updatePackageSession(id: string, dto: UpdatePackageDto) {
    const sessionPackage = await this.packageOfferingRepository.findOne({
      where: { id: id },
      relations: ['packageType', 'portfolio'],
    });
    if (!sessionPackage) {
      this.exceptionHandler.throwNotFound(_404.PACKAGE_OFFERING_NOT_FOUND);
    }
    sessionPackage.packageType.maximumSessions =
      dto.sessionCount ?? sessionPackage.packageType.maximumSessions;
    sessionPackage.discount = dto.discountPercentage ?? sessionPackage.discount;
    sessionPackage.packageType.description =
      dto.description ?? sessionPackage.packageType.description;

    return this.packageOfferingRepository.save(sessionPackage);
  }
}
