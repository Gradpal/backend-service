import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Tutor } from './entities/tutor.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { WeeklyAvailabilityDto } from './dto/weekly-availability.dto';
import { Visibility } from './dto/visibility.dto';
import { TutorListingDto } from './dto/tutor-listing.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { EUserRole } from '../user/enums/user-role.enum';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import {
  WeeklyScheduleDto,
  DaySchedule,
  WeekDay,
  TimeSlot,
} from './dto/schedule-slot.dto';
import * as moment from 'moment';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { SessionInvitationDto } from './dto/session-invitation.dto';
import {
  TutorDashboardDto,
  UpcomingAppointmentDto,
} from './dto/tutor-dashboard.dto';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly minioService: MinioClientService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    languages?: string[];
    subjects?: string[];
    minPrice?: number;
    maxPrice?: number;
  }) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tutor', 'tutor')
      .where('user.role = :role', { role: EUserRole.TUTOR });

    // Apply search filter
    if (filters.search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR tutor.institution ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply language filter
    if (filters.languages?.length) {
      query.andWhere('tutor.languages::jsonb @> :languages::jsonb', {
        languages: JSON.stringify({ value: filters.languages }),
      });
    }

    // Apply subjects filter
    if (filters.subjects?.length) {
      query.andWhere('tutor.subjects @> :subjects', {
        subjects: filters.subjects,
      });
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      query.andWhere('tutor.price_per_hour >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }
    if (filters.maxPrice !== undefined) {
      query.andWhere('tutor.price_per_hour <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Get paginated results
    const [users, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    // Transform to DTOs
    const tutorListings = users.map((user) => TutorListingDto.fromEntity(user));

    return createPaginatedResponse(
      tutorListings,
      total,
      filters.page,
      filters.limit,
    );
  }

  async getProfile(id: string): Promise<TutorProfileDto> {
    const tutor = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.profile', 'profile')
      .where('tutor.id = :id', { id })
      .getOne();

    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    return TutorProfileDto.fromEntity(tutor);
  }

  async create(
    createTutorDto: CreateTutorDto,
    files?: {
      introductory_video?: Express.Multer.File[];
      degree_certificates?: Express.Multer.File[];
    },
  ): Promise<Tutor> {
    // Get the user profile
    const userProfile = await this.userRepository.findOneBy({
      id: createTutorDto.profileId,
    });
    if (!userProfile) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }

    // Create base tutor entity without file fields
    const {
      introductory_video,
      degree_certificates,
      ...tutorDataWithoutFiles
    } = createTutorDto;
    const tutorData: Partial<Tutor> = {
      ...tutorDataWithoutFiles,
      profile: userProfile,
      languages: {
        value: createTutorDto.languages || [],
        visible: true,
      } as unknown as Visibility<string[]>,
      religious_affiliation: createTutorDto.religious_affiliation
        ? ({
            value: createTutorDto.religious_affiliation,
            visible: false,
          } as unknown as Visibility<string>)
        : null,
      gender: createTutorDto.gender
        ? ({
            value: createTutorDto.gender,
            visible: false,
          } as unknown as Visibility<string>)
        : null,
    };

    const tutor = this.tutorRepository.create(tutorData);

    // Handle introductory video upload
    if (files?.introductory_video?.[0]) {
      const videoUrl = await this.minioService.uploadFile(
        files.introductory_video[0],
      );
      tutor.introductory_video = videoUrl;
    }

    // Handle degree certificates upload
    if (files?.degree_certificates?.length && tutor.institutions?.length) {
      for (
        let i = 0;
        i <
        Math.min(files.degree_certificates.length, tutor.institutions.length);
        i++
      ) {
        const certificateUrl = await this.minioService.uploadFile(
          files.degree_certificates[i],
        );
        if (tutor.institutions[i]) {
          tutor.institutions[i].degree_certificate = certificateUrl;
        }
      }
    }

    const savedTutor = await this.tutorRepository.save(tutor);
    return savedTutor;
  }

  async findOne(id: string): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOneBy({ id });
    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    return tutor;
  }

  async updateProfile(
    id: string,
    updateTutorProfileDto: UpdateTutorProfileDto,
    files?: {
      introductory_video?: Express.Multer.File[];
      degree_certificates?: Express.Multer.File[];
    },
  ): Promise<Tutor> {
    const tutor = await this.findOne(id);

    // Remove file fields from the update data
    const updateDataWithoutFiles = { ...updateTutorProfileDto };
    delete (updateDataWithoutFiles as any).introductory_video;
    delete (updateDataWithoutFiles as any).degree_certificates;

    // Update tutor data with proper visibility structure
    if (updateDataWithoutFiles.languages) {
      (updateDataWithoutFiles as any).languages = {
        value: updateDataWithoutFiles.languages,
        visible: (tutor.languages as Visibility<string[]>)?.visible ?? true,
      };
    }
    if (updateDataWithoutFiles.religious_affiliation) {
      (updateDataWithoutFiles as any).religious_affiliation = {
        value: updateDataWithoutFiles.religious_affiliation,
        visible:
          (tutor.religious_affiliation as Visibility<string>)?.visible ?? false,
      };
    }
    if (updateDataWithoutFiles.gender) {
      (updateDataWithoutFiles as any).gender = {
        value: updateDataWithoutFiles.gender,
        visible: (tutor.gender as Visibility<string>)?.visible ?? false,
      };
    }

    Object.assign(tutor, updateDataWithoutFiles);

    // Handle introductory video upload
    if (files?.introductory_video?.[0]) {
      const videoUrl = await this.minioService.uploadFile(
        files.introductory_video[0],
      );
      tutor.introductory_video = videoUrl;
    }

    // Handle degree certificates upload
    if (files?.degree_certificates?.length && tutor.institutions?.length) {
      for (
        let i = 0;
        i <
        Math.min(files.degree_certificates.length, tutor.institutions.length);
        i++
      ) {
        const certificateUrl = await this.minioService.uploadFile(
          files.degree_certificates[i],
        );
        if (tutor.institutions[i]) {
          tutor.institutions[i].degree_certificate = certificateUrl;
        }
      }
    }

    const savedTutor = await this.tutorRepository.save(tutor);
    return savedTutor;
  }

  async updateAvailability(
    id: string,
    weeklyAvailabilityDto: WeeklyAvailabilityDto,
  ): Promise<Tutor> {
    const tutor = await this.findOne(id);
    tutor.weekely_availability = weeklyAvailabilityDto;
    return await this.tutorRepository.save(tutor);
  }

  async acceptTerms(id: string): Promise<Tutor> {
    const tutor = await this.findOne(id);
    tutor.complying_with_rules = true;
    return await this.tutorRepository.save(tutor);
  }

  async getSchedule(
    id: string,
    startDate?: string,
  ): Promise<WeeklyScheduleDto> {
    const tutor = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.profile', 'profile')
      .where('tutor.id = :id', { id })
      .getOne();

    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    // Parse the weekly availability from tutor data
    const weeklyAvailability = tutor.weekely_availability || {};
    const start = startDate ? moment(startDate) : moment().startOf('week');

    // Create schedule for each day
    const schedule: DaySchedule[] = Object.values(WeekDay).map((day) => {
      const dayAvailability = weeklyAvailability[day.toLowerCase()] || [];
      const timeSlots: TimeSlot[] = dayAvailability.map((slot) => ({
        startTime: slot.start,
        endTime: slot.end,
        isBooked: false, // This should be checked against bookings table
      }));

      return {
        day,
        timeSlots,
      };
    });

    return {
      schedule,
      timezone: tutor.timezone,
    };
  }

  async getUpcomingSessions(tutorId: string): Promise<Booking[]> {
    const now = new Date();
    return this.bookingRepository.find({
      where: {
        tutor: { id: tutorId },
        status: BookingStatus.APPROVED,
        sessionDate: MoreThanOrEqual(now.toISOString().split('T')[0]),
      },
      relations: ['student', 'student.profile'],
      order: {
        sessionDate: 'ASC',
        sessionTime: 'ASC',
      },
    });
  }

  async getBooking(bookingId: string): Promise<SessionDetailsDto> {
    const booking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.student', 'student')
      .leftJoinAndSelect('student.profile', 'studentProfile')
      .leftJoinAndSelect('booking.tutor', 'tutor')
      .leftJoinAndSelect('tutor.profile', 'tutorProfile')
      .where('booking.id = :id', { id: bookingId })
      .getOne();

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    const timeline = [
      {
        action: 'Booking created',
        timestamp: booking.createdAt,
        by: booking.student.profile.userName,
      },
      {
        action: 'Booking approved',
        timestamp: booking.updatedAt,
        by: booking.tutor.profile.userName,
      },
      {
        action: 'Booking completed',
        timestamp: booking.updatedAt,
        by: booking.tutor.profile.userName,
      },
    ];

    return {
      id: booking.id,
      sessionDate: booking.sessionDate,
      sessionTime: booking.sessionTime,
      timezone: booking.tutor.timezone || 'UTC',
      tutor: {
        id: booking.tutor.id,
        name: `${booking.tutor.profile.firstName} ${booking.tutor.profile.lastName.charAt(0)}.`,
        university: booking.tutor.university,
        isVerified: booking.tutor.isVerified,
        profilePicture: booking.tutor.profile.profilePicture,
        countryCode: booking.tutor.countries_of_citizenship?.[0] || '',
      },
      student: {
        id: booking.student.id,
        name: `${booking.student.profile.firstName} ${booking.student.profile.lastName}`,
        email: booking.student.profile.email,
        profilePicture: booking.student.profile.profilePicture,
      },
      subject: booking.sessionType,
      duration: '90 minutes',
      creditsUsed: booking.creditsUsed,
      communicationTool: {
        name: 'Gradpal Classroom',
        description:
          'Gradpal Classroom is the communication experience on the gradpal platform, where tutors interact with theirs students through a visual meeting',
        joinUrl:
          booking.status === BookingStatus.APPROVED
            ? '/classroom/join'
            : undefined,
      },
      documents: booking.materialsUrl
        ? [
            {
              name: 'Reference Materials',
              url: booking.materialsUrl,
            },
          ]
        : [],
      description: booking.description,
      timeline,
      status: booking.status,
    };
  }

  async getSessionInvitations(
    tutorId: string,
  ): Promise<SessionInvitationDto[]> {
    const bookings = await this.bookingRepository.find({
      where: {
        tutor: { id: tutorId },
        status: BookingStatus.PENDING,
      },
      relations: ['tutor', 'tutor.profile'],
      order: {
        createdAt: 'DESC',
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      tutor: {
        id: booking.tutor.id,
        name: `${booking.tutor.profile.firstName} ${booking.tutor.profile.lastName.charAt(0)}.`,
        university: booking.tutor.university,
        isVerified: booking.tutor.isVerified,
        profilePicture: booking.tutor.profile.profilePicture,
        countryCode: booking.tutor.countries_of_citizenship?.[0] || '',
      },
      subject: booking.sessionType,
      description:
        booking.description ||
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      status: 'invited',
      createdAt: booking.createdAt,
    }));
  }

  async respondToInvitation(
    tutorId: string,
    bookingId: string,
    accept: boolean,
  ): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        tutor: { id: tutorId },
        status: BookingStatus.PENDING,
      },
    });

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    booking.status = accept ? BookingStatus.APPROVED : BookingStatus.REJECTED;
    await this.bookingRepository.save(booking);
  }

  async getDashboard(tutorId: string): Promise<TutorDashboardDto> {
    // Get tutor profile
    const profile = await this.getProfile(tutorId);

    // Get upcoming appointments
    const upcomingBookings = await this.bookingRepository.find({
      where: {
        tutor: { id: tutorId },
        status: BookingStatus.APPROVED,
        sessionDate: MoreThanOrEqual(moment().format('YYYY-MM-DD')),
      },
      relations: ['student'],
      order: {
        sessionDate: 'ASC',
        sessionTime: 'ASC',
      },
      take: 5,
    });

    // Get wallet balance (credits)
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
      select: ['payment_info'],
    });

    return {
      profile,
      wallet: {
        credits: tutor?.payment_info?.credits || 0,
      },
      upcomingAppointments: upcomingBookings.map((booking) =>
        UpcomingAppointmentDto.fromEntity(booking),
      ),
    };
  }
}
