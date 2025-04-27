import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { UserService } from '../user/user.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _409 } from '@app/common/constants/errors-constants';
import { plainToClass } from 'class-transformer';
import { BrainService } from '@app/common/brain/brain.service';
import { User } from '../user/entities/user.entity';
import { Institution } from './dto/institution.dto';
import { EducationRecord } from './entities/education-record.entity';
import { CreateEducationRecordDto } from './dto/create-education-record.dto';
import { UpdateEducationRecordDto } from './dto/update-education-record.dto';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioProfileDto } from './dto/update-portfolio-profile.dto';
import { UpdatePortfolioAvailabilityDto } from './dto/update-portfolio-availability.dto';
import { _404 } from '@app/common/constants/errors-constants';
import { EUserRole } from '../user/enums/user-role.enum';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import { TutorDashboardDto } from './dto/tutor-dashboard.dto';
import { WeeklyScheduleDto } from '../user/dto/schedule-slot.dto';
import { SessionInvitationDto } from '../user/dto/session-invitation.dto';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { MoreThanOrEqual } from 'typeorm';
import { MinioClientService } from '../minio-client/minio-client.service';
@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    @InjectRepository(EducationRecord)
    private readonly educationRecordRepository: Repository<EducationRecord>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly minioService: MinioClientService,
  ) {}

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
      relations: ['educationRecords'],
    });
  }

  async findOne(id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['educationRecords'],
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return portfolio;
  }

  async addEducationRecord(
    portfolioId: string,
    createEducationRecordDto: CreateEducationRecordDto,
  ): Promise<EducationRecord> {
    const portfolio = await this.findOne(portfolioId);
    const educationRecord = this.educationRecordRepository.create({
      ...createEducationRecordDto,
      portfolio,
    });
    return this.educationRecordRepository.save(educationRecord);
  }

  async updateEducationRecord(
    portfolioId: string,
    educationRecordId: string,
    updateEducationRecordDto: UpdateEducationRecordDto,
  ): Promise<EducationRecord> {
    const educationRecord = await this.educationRecordRepository.findOne({
      where: { id: educationRecordId, portfolio: { id: portfolioId } },
    });

    if (!educationRecord) {
      throw new NotFoundException(
        `Education record with ID ${educationRecordId} not found in portfolio ${portfolioId}`,
      );
    }

    Object.assign(educationRecord, updateEducationRecordDto);
    return this.educationRecordRepository.save(educationRecord);
  }

  async removeEducationRecord(
    portfolioId: string,
    educationRecordId: string,
  ): Promise<void> {
    const educationRecord = await this.educationRecordRepository.findOne({
      where: { id: educationRecordId, portfolio: { id: portfolioId } },
    });

    if (!educationRecord) {
      throw new NotFoundException(
        `Education record with ID ${educationRecordId} not found in portfolio ${portfolioId}`,
      );
    }

    await this.educationRecordRepository.remove(educationRecord);
  }

  async updatePortfolioProfile(
    id: string,
    updatePortfolioProfileDto: UpdatePortfolioProfileDto,
    files?: Express.Multer.File[],
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

    // Handle files
    if (files && files.length > 0) {
      // Group files by their fieldname
      const groupedFiles = files.reduce(
        (acc, file) => {
          const fieldName = file.fieldname;
          if (!acc[fieldName]) {
            acc[fieldName] = [];
          }
          acc[fieldName].push(file);
          return acc;
        },
        {} as Record<string, Express.Multer.File[]>,
      );

      // Handle introductory video
      if (groupedFiles['introductoryVideo']?.[0]) {
        const videoUrl = await this.minioService.uploadFile(
          groupedFiles['introductoryVideo'][0],
        );
        portfolio.introductoryVideo = videoUrl;
      }

      // Handle institution files
      if (updateDataWithoutFiles.institutions) {
        const institutions = updateDataWithoutFiles.institutions.map(
          (institution) => ({
            name: institution.name,
            degreeType: institution.degreeType,
            yearStarted: institution.yearStarted,
            yearEnded: institution.yearEnded,
            academicTranscript: null,
            degreeCertificate: null,
          }),
        );

        // Process academic transcripts
        const transcriptFiles = files.filter(
          (f) =>
            f.fieldname.startsWith('institutions[') &&
            f.fieldname.includes('][academicTranscript]'),
        );

        for (const file of transcriptFiles) {
          const match = file.fieldname.match(
            /institutions\[(\d+)\]\[academicTranscript\]/,
          );
          if (match && institutions[parseInt(match[1])]) {
            const transcriptUrl = await this.minioService.uploadFile(file);
            institutions[parseInt(match[1])].academicTranscript = transcriptUrl;
          }
        }

        // Process degree certificates
        const certificateFiles = files.filter(
          (f) =>
            f.fieldname.startsWith('institutions[') &&
            f.fieldname.includes('][degreeCertificate]'),
        );

        for (const file of certificateFiles) {
          const match = file.fieldname.match(
            /institutions\[(\d+)\]\[degreeCertificate\]/,
          );
          if (match && institutions[parseInt(match[1])]) {
            const certificateUrl = await this.minioService.uploadFile(file);
            institutions[parseInt(match[1])].degreeCertificate = certificateUrl;
          }
        }

        portfolio.institutions = institutions;
      }
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
    id: string,
    updatePortfolioAvailabilityDto: UpdatePortfolioAvailabilityDto,
  ): Promise<Portfolio> {
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

    portfolio.weeklyAvailability = updatePortfolioAvailabilityDto;
    return await this.portfolioRepository.save(portfolio);
  }

  async getTutorProfile(id: string): Promise<TutorProfileDto> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['user', 'educationRecords', 'educationRecords.institution'],
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
}
