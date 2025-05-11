import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { UserService } from '../user/user.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { plainToClass } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { Institution } from './dto/institution.dto';
import { EducationInstitutionRecord } from './entities/education-record.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import {
  UpdatePersonalStatementDto,
  UpdatePortfolioProfileDto,
  UpdateIntroductoryVideoDto,
  UpdateSubjectsOfInterestDto,
} from './dto/update-portfolio-profile.dto';
import { UpdatePortfolioAvailabilityDto } from './dto/update-portfolio-availability.dto';
import { _400, _404 } from '@app/common/constants/errors-constants';
import { EUserRole } from '../user/enums/user-role.enum';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import { SessionInvitationDto } from '../user/dto/session-invitation.dto';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { MoreThanOrEqual } from 'typeorm';
import { MinioClientService } from '../minio-client/minio-client.service';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { SubjectTierService } from '../subjects/subject-tier/subject-tier.service';
import { CreateEducationInstitutionRecordDto } from './dto/create-education-record.dto';
import { generateUUID } from '@app/common/helpers/shared.helpers';
import { SubjectsService } from '../subjects/subjects.service';
import { SavedTutorDto } from './dto/dashboard-response.dto';
import { ClassSessionService } from '../class-session/class-session.service';
import {
  DaySchedule,
  TimeSlot,
  WeeklyAvailability,
} from './weekly-availability/entities/weeky-availability.entity';
import { WeekDay } from './weekly-availability/enums/week-day.enum';
import { WeeklyScheduleDto } from './dto/schedule-slot.dto';
@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(WeeklyAvailability)
    private readonly weeklyAvailabilityRepository: Repository<WeeklyAvailability>,
    @InjectRepository(DaySchedule)
    private readonly dayScheduleRepository: Repository<DaySchedule>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly minioService: MinioClientService,
    @Inject(forwardRef(() => SubjectsService))
    private readonly subjectService: SubjectsService,
    private readonly sessionService: ClassSessionService,
  ) {}

  getPortfolioRepository() {
    return this.portfolioRepository;
  }
  async createPortfolio(user: User) {
    const portfolio = this.portfolioRepository.create({
      user,
    });
    await this.portfolioRepository.save(portfolio);
    user.portfolio = portfolio;
    await this.userService.save(user);
    return plainToClass(Portfolio, portfolio);
  }

  async findByOnwer(user: User) {
    const portfolio = await this.portfolioRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });

    return portfolio;
  }

  async save(portfolio: Portfolio) {
    return await this.portfolioRepository.save(portfolio);
  }

  async create(createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
    });
    return this.portfolioRepository.save(portfolio);
  }

  async findAll(): Promise<Portfolio[]> {
    return this.portfolioRepository.find({
      relations: ['educationInstitutionRecords'],
    });
  }

  async findOne(id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['subjectTiers', 'subjects', 'user'],
    });
    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.PORTFOLIO_NOT_FOUND);
    }
    return portfolio;
  }

  async findByUser(user: User): Promise<Portfolio> {
    return this.portfolioRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['subjectTiers'],
    });
  }

  async addEducationInstitution(
    portfolioId: string,
    createEducationInstitutionRecordDto: CreateEducationInstitutionRecordDto,
    certificate?: Express.Multer.File,
  ): Promise<Portfolio> {
    const portfolio: Portfolio = await this.findOne(portfolioId);
    const educationInstitutionRecords =
      portfolio.educationInstitutionRecords || [];
    const educationRecord = plainToClass(
      EducationInstitutionRecord,
      createEducationInstitutionRecordDto,
    );

    educationRecord.id = generateUUID();

    if (certificate) {
      const certificateUrl =
        await this.minioService.getUploadedFilePath(certificate);
      educationRecord.certificate = certificateUrl;
    }
    educationInstitutionRecords.push(educationRecord);
    portfolio.educationInstitutionRecords = educationInstitutionRecords;
    return await this.portfolioRepository.save(portfolio);
  }

  async addSubjectsOfInterest(
    portfolioId: string,
    subjectsOfInterest: UpdateSubjectsOfInterestDto,
    user: User,
  ): Promise<Portfolio> {
    this.validatePortfolioOnwership(portfolioId, user);
    const portfolio = await this.findOne(portfolioId);
    const currentSubjects = portfolio.subjectsOfInterest || [];

    const newSubjects = await Promise.all(
      subjectsOfInterest.subjectsIds.map((subjectId) =>
        this.subjectService.findOne(subjectId),
      ),
    );
    portfolio.subjectsOfInterest = [...currentSubjects, ...newSubjects];
    return await this.portfolioRepository.save(portfolio);
  }

  async updatePersonalStatement(
    portfolioId: string,
    updatePersonalStatementDto: UpdatePersonalStatementDto,
    user: User,
  ): Promise<Portfolio> {
    this.validatePortfolioOnwership(portfolioId, user);
    const portfolio = await this.findOne(portfolioId);
    portfolio.personalStatement = updatePersonalStatementDto.personalStatement;
    return await this.portfolioRepository.save(portfolio);
  }

  async updateIntroductoryVideo(
    portfolioId: string,
    updateIntroductoryVideoDto: UpdateIntroductoryVideoDto,
    user: User,
    introductoryVideo?: Express.Multer.File,
  ): Promise<Portfolio> {
    this.validatePortfolioOnwership(portfolioId, user);
    const portfolio = await this.findOne(portfolioId);
    portfolio.introductoryVideo =
      await this.minioService.getUploadedFilePath(introductoryVideo);
    return await this.portfolioRepository.save(portfolio);
  }

  async validatePortfolioOnwership(
    portfolioId: string,
    user: User,
  ): Promise<void> {
    const portfolio = await this.findOne(portfolioId);
    if (portfolio.user.id !== user.id) {
      this.exceptionHandler.throwBadRequest(_400.PORTFOLIO_NOT_OWNER);
    }
  }

  // async addEducationRecord(
  //   portfolioId: string,
  //   createEducationRecordDto: CreateEducationInstitutionRecordDto,
  // ): Promise<EducationInstitutionRecord> {
  //   const portfolio = await this.findOne(portfolioId);

  //   const educationInstitutionRecord = new EducationInstitutionRecord();
  //   const educationInstitutionRecords = portfolio.educationInstitutionRecords;

  //   if (createEducationRecordDto.certificate) {
  //     const certificateUrl = await this.minioService.getUploadedFilePath(
  //       createEducationRecordDto.certificate,
  //     );
  //     educationInstitutionRecord.certificate = certificateUrl;
  //   }
  //   educationInstitutionRecords.push(educationInstitutionRecord);
  //   portfolio.educationInstitutionRecords = educationInstitutionRecords;
  //   return this.educationInstitutionRecordRepository.save(
  //     educationInstitutionRecord,
  //   );
  // }

  // async updateEducationRecord(
  //   portfolioId: string,
  //   educationRecordId: string,
  //   updateEducationRecordDto: UpdateEducationRecordDto,
  // ): Promise<EducationInstitutionRecord> {
  //   const educationRecord =
  //     await this.educationInstitutionRecordRepository.findOne({
  //       where: { id: educationRecordId, portfolio: { id: portfolioId } },
  //     });

  //   if (!educationRecord) {
  //     throw new NotFoundException(
  //       `Education record with ID ${educationRecordId} not found in portfolio ${portfolioId}`,
  //     );
  //   }

  //   Object.assign(educationRecord, updateEducationRecordDto);
  //   return this.educationInstitutionRecordRepository.save(educationRecord);
  // }

  // async removeEducationRecord(
  //   portfolioId: string,
  //   educationRecordId: string,
  // ): Promise<void> {
  //   const educationRecord =
  //     await this.educationInstitutionRecordRepository.findOne({
  //       where: { id: ed   ucationRecordId },
  //     });

  //   if (!educationRecord) {
  //     this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
  //   }

  //   await this.educationInstitutionRecordRepository.remove(educationRecord);
  // }

  async updatePortfolioProfile(
    id: string,
    updatePortfolioProfileDto: UpdatePortfolioProfileDto,
    introductoryVideos?: Express.Multer.File[],
    academicTranscripts?: Express.Multer.File[],
    degreeCertificates?: Express.Multer.File[],
  ): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }
    // Remove file fields from the update data
    const updateDataWithoutFiles = { ...updatePortfolioProfileDto };
    delete (updateDataWithoutFiles as any).introductoryVideo;
    delete (updateDataWithoutFiles as any).academicTranscript;
    delete (updateDataWithoutFiles as any).degreeCertificate;

    // Update tutor data with proper visibility structure
    if (updateDataWithoutFiles.languages) {
      updateDataWithoutFiles.languages = JSON.parse(
        updateDataWithoutFiles.languages as any,
      );

      (updateDataWithoutFiles as any).languages = {
        value: updateDataWithoutFiles.languages.value,
        visible: updateDataWithoutFiles.languages.visible,
      };
    }
    if (updateDataWithoutFiles.religiousAffiliation) {
      updateDataWithoutFiles.religiousAffiliation = JSON.parse(
        updateDataWithoutFiles.religiousAffiliation as any,
      );
      (updateDataWithoutFiles as any).religiousAffiliation = {
        value: updateDataWithoutFiles.religiousAffiliation.value,
        visible: updateDataWithoutFiles.religiousAffiliation.visible,
      };
    }
    if (updateDataWithoutFiles.gender) {
      updateDataWithoutFiles.gender = JSON.parse(
        updateDataWithoutFiles.gender as any,
      );
      (updateDataWithoutFiles as any).gender = {
        value: updateDataWithoutFiles.gender.value,
        visible: updateDataWithoutFiles.gender.visible,
      };
    }

    Object.assign(portfolio, updateDataWithoutFiles);

    if (introductoryVideos) {
      const videoUrl = await this.minioService.getUploadedFilePath(
        introductoryVideos[0],
      );
      portfolio.introductoryVideo = videoUrl;
    }
    if (academicTranscripts) {
      const academicTranscriptsUrls = await this.minioService.uploadAttachments(
        academicTranscripts,
        portfolio.academicTranscripts,
      );
      portfolio.academicTranscripts = academicTranscriptsUrls;
    }
    if (degreeCertificates) {
      const degreeCertificatesUrls = await this.minioService.uploadAttachments(
        degreeCertificates,
        portfolio.degreeCertificates,
      );
      portfolio.degreeCertificates = degreeCertificatesUrls;
    }

    if (updateDataWithoutFiles.countryOfResidence) {
      portfolio.countryOfResidence = updateDataWithoutFiles.countryOfResidence;
    }
    if (updateDataWithoutFiles.time_zone) {
      portfolio.timezone = updateDataWithoutFiles.time_zone;
    }
    if (updateDataWithoutFiles.time_zone_display_format) {
      portfolio.time_zone_display_format =
        updateDataWithoutFiles.time_zone_display_format;
    }
    if (updateDataWithoutFiles.highest_degree) {
      portfolio.highestDegree = updateDataWithoutFiles.highest_degree;
    }

    if (updateDataWithoutFiles.countriesOfCitizenship) {
      portfolio.countriesOfCitizenship = JSON.parse(
        updateDataWithoutFiles.countriesOfCitizenship as any,
      ) as string[];
    }

    return await this.portfolioRepository.save(portfolio);
  }

  async updatePortfolioAvailability(
    tutor: User,
    availabilityDto: UpdatePortfolioAvailabilityDto,
  ) {
    const portfolio = await this.findByUser(tutor);

    let weeklyAvailability = new WeeklyAvailability();
    weeklyAvailability.timezone = portfolio.timezone;
    weeklyAvailability =
      await this.weeklyAvailabilityRepository.save(weeklyAvailability);

    if (availabilityDto.monday) {
      const slotsDtos = availabilityDto.monday;

      const mondaySchedule = new DaySchedule();
      mondaySchedule.day = WeekDay.MONDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.owner = tutor;
        slotEntity.daySchedule = mondaySchedule;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      mondaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(mondaySchedule);
    }

    if (availabilityDto.tuesday) {
      const slotsDtos = availabilityDto.monday;

      const tuesdaySchedule = new DaySchedule();
      tuesdaySchedule.day = WeekDay.TUESDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.owner = tutor;
        slotEntity.daySchedule = tuesdaySchedule;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      tuesdaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(tuesdaySchedule);
    }

    if (availabilityDto.wednesday) {
      const slotsDtos = availabilityDto.wednesday;

      const wednesdaySchedule = new DaySchedule();
      wednesdaySchedule.day = WeekDay.WEDNESDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.owner = tutor;
        slotEntity.daySchedule = wednesdaySchedule;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      wednesdaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(wednesdaySchedule);
    }

    if (availabilityDto.thursday) {
      const slotsDtos = availabilityDto.thursday;

      const thursdaySchedule = new DaySchedule();
      thursdaySchedule.day = WeekDay.THURSDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.owner = tutor;
        slotEntity.daySchedule = thursdaySchedule;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      thursdaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(thursdaySchedule);
    }

    if (availabilityDto.friday) {
      const slotsDtos = availabilityDto.friday;

      const fridaySchedule = new DaySchedule();
      fridaySchedule.day = WeekDay.FRIDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.daySchedule = fridaySchedule;
        slotEntity.owner = tutor;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      fridaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(fridaySchedule);
    }

    if (availabilityDto.saturday) {
      const slotsDtos = availabilityDto.saturday;

      const saturdaySchedule = new DaySchedule();
      saturdaySchedule.day = WeekDay.SATURDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.daySchedule = saturdaySchedule;
        slotEntity.owner = tutor;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      saturdaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(saturdaySchedule);
    }

    if (availabilityDto.sunday) {
      const slotsDtos = availabilityDto.sunday;

      const sundaySchedule = new DaySchedule();
      sundaySchedule.day = WeekDay.SUNDAY;

      const timeSlots = [];

      slotsDtos.forEach(async (slot) => {
        let slotEntity = new TimeSlot();
        slotEntity.startTime = slot.startTime;
        slotEntity.endTime = slot.endTime;
        slotEntity.daySchedule = sundaySchedule;
        slotEntity.owner = tutor;
        slotEntity = await this.timeSlotRepository.save(slotEntity);
        timeSlots.push(slotEntity);
      });
      sundaySchedule.weeklyAvailability = weeklyAvailability;
      await this.dayScheduleRepository.save(sundaySchedule);
    }
  }

  async getTutorProfile(id: string): Promise<TutorProfileDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }

    if (portfolio.user.role !== EUserRole.TUTOR) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    return TutorProfileDto.fromEntity(portfolio.user, portfolio);
  }

  async getTutorSchedule(
    id: string,
    startDate?: string,
  ): Promise<WeeklyScheduleDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }

    if (portfolio.user.role !== EUserRole.TUTOR) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    // Implementation of schedule retrieval logic
    // This is a placeholder - you'll need to implement the actual schedule logic
    return new WeeklyScheduleDto();
  }

  async getUpcomingSessions(id: string): Promise<Booking[]> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }

    if (portfolio.user.role !== EUserRole.TUTOR) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    const today = new Date().toISOString().split('T')[0];
    return this.bookingRepository.find({
      where: {
        tutor: { id: portfolio.user.id },
        status: BookingStatus.APPROVED,
        sessionDate: MoreThanOrEqual(today),
      },
      relations: ['student', 'tutor'],
    });
  }

  async getSessionDetails(sessionId: string): Promise<SessionDetailsDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: sessionId },
      relations: ['student', 'tutor'],
    });

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    return plainToClass(SessionDetailsDto, booking);
  }
  async getPortfolioById(portfolioId: string): Promise<Portfolio> {
    const portfoio = await this.findOne(portfolioId);
    return portfoio;
  }

  async getSessionInvitations(id: string): Promise<SessionInvitationDto[]> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }

    if (portfolio.user.role !== EUserRole.TUTOR) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    // Implementation of session invitations retrieval
    // This is a placeholder - you'll need to implement the actual invitations logic
    return [];
  }

  async basicSearchTutors({
    name,
    page = 1,
    limit = 10,
  }: {
    name?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.userService
      .getUserRepository()
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'TUTOR' });
    if (name) {
      query.andWhere(
        '(user.firstName ILIKE :name OR user.lastName ILIKE :name)',
        { name: `%${name}%` },
      );
    }
    query.skip((page - 1) * limit).take(limit);
    const [tutors, count] = await query.getManyAndCount();
    return {
      data: tutors,
      total: count,
      page,
      limit,
    };
  }

  async advancedSearchTutors({
    subjectId,
    language,
    country,
    priceMin,
    priceMax,
    name,
    degree,
    school,
    category,
    gender,
    religion,
    nationality,
    dates,
    page = 1,
    limit = 10,
  }: {
    subjectId?: string;
    language?: string;
    country?: string;
    priceMin?: number;
    priceMax?: number;
    name?: string;
    degree?: string;
    school?: string;
    category?: string;
    gender?: string;
    religion?: string;
    nationality?: string;
    dates?: string;
    page?: number;
    limit?: number;
  }) {
    const query = this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.user', 'user')
      .leftJoinAndSelect('portfolio.subjectTiers', 'subjectTier')
      .where('user.role = :role', { role: EUserRole.TUTOR });

    if (name) {
      query.andWhere(
        '(user.firstName ILIKE :name OR user.lastName ILIKE :name)',
        { name: `%${name}%` },
      );
    }
    if (country) {
      query.andWhere('portfolio.countryOfResidence = :country', { country });
    }
    if (subjectId) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM subjects_tiers sts WHERE sts.subject_tier_id = subjectTier.id AND sts.subject_id = :subjectId)',
        {
          subjectId: subjectId,
        },
      );
    }
    if (language) {
      query.andWhere(':language = ANY(portfolio.spokenLanguages)', {
        language,
      });
    }
    if (priceMin || priceMax) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM subject_tier st WHERE st.portfolio_id = portfolio.id AND ' +
          (priceMin ? 'st.credits >= :priceMin' : '1=1') +
          (priceMin && priceMax ? ' AND ' : '') +
          (priceMax ? 'st.credits <= :priceMax' : '1=1') +
          ')',
        { priceMin, priceMax },
      );
    }
    if (category) {
      query.andWhere(':category = ANY(portfolio.session_type)', { category });
    }
    if (gender) {
      query.andWhere('portfolio.gender = :gender', { gender });
    }
    if (religion) {
      query.andWhere('portfolio.religiousAffiliation = :religion', {
        religion,
      });
    }
    if (nationality) {
      query.andWhere(':nationality = ANY(portfolio.countriesOfCitizenship)', {
        nationality,
      });
    }

    query.skip((page - 1) * limit).take(limit);
    const [tutors, count] = await query.getManyAndCount();
    return createPaginatedResponse(tutors, count, page, limit);
  }

  async saveTutor(student: User, tutorPortfolioId: string): Promise<Portfolio> {
    const studentPortfolio = await this.findByOnwer(student);
    const tutorPortfolio = await this.findOne(tutorPortfolioId);
    const savedTutors = studentPortfolio.savedTutors || [];
    const savedTtutorDto = new SavedTutorDto();

    savedTtutorDto.id = tutorPortfolio.id;
    savedTtutorDto.firstName = tutorPortfolio.user.firstName;
    savedTtutorDto.lastName = tutorPortfolio.user.lastName;
    savedTtutorDto.nationality = tutorPortfolio.nationality;
    savedTtutorDto.profilePicture = tutorPortfolio.user.profilePicture;
    savedTtutorDto.countryOfResidence = tutorPortfolio.countryOfResidence;
    savedTtutorDto.timezone = tutorPortfolio.timezone;
    savedTtutorDto.isVerified = tutorPortfolio.isVerified;
    savedTtutorDto.totalReviews = tutorPortfolio?.reviews?.length;
    savedTtutorDto.totalStudents = tutorPortfolio.totalStudents;

    const totalSessions = await this.sessionService.findByTutor(
      tutorPortfolio.user.id,
    );
    savedTtutorDto.totalSessions = totalSessions?.length;
    savedTtutorDto.attendanceRate = tutorPortfolio.attendanceRate;
    savedTtutorDto.responseRate = tutorPortfolio.responseRate;

    savedTutors.push(savedTtutorDto);

    const portfolio = await this.findOne(studentPortfolio.id);
    portfolio.savedTutors = savedTutors;
    return await this.portfolioRepository.save(portfolio);
  }

  async getSubjectTier(portfolioId: string, subject: string): Promise<null> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.DATABASE_RECORD_NOT_FOUND);
    }

    return portfolio.subjectTiers?.[subject] || null;
  }
}
