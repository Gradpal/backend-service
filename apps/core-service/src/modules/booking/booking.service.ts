import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingRequestDto } from './dto/booking-request.dto';
import { SessionDetailsDto, TimelineEvent } from './dto/session-details.dto';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400, _403 } from '@app/common/constants/errors-constants';
import { MinioClientService } from '../minio-client/minio-client.service';
import { UserService } from '../user/user.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { Portfolio } from '../portfolio/entities/portfolio.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly minioService: MinioClientService,
    private readonly userService: UserService,
    private readonly portfolioService: PortfolioService,
  ) {}

  async createBooking(
    student: User,
    bookingRequestDto: BookingRequestDto,
    materials?: Express.Multer.File,
  ): Promise<Booking> {
    const tutor = await this.userService.findOne(bookingRequestDto.tutorId);

    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    if (student.credits < bookingRequestDto.creditsToUse) {
      this.exceptionHandler.throwBadRequest(_400.INSUFFICIENT_CREDITS);
    }

    // Check if time slot is available
    const isSlotAvailable = await this.isTimeSlotAvailable(
      tutor.id,
      bookingRequestDto.selectedDate,
      bookingRequestDto.selectedTimeSlot,
    );
    if (!isSlotAvailable) {
      this.exceptionHandler.throwBadRequest(_400.TIME_SLOT_NOT_AVAILABLE);
    }

    // Handle materials upload if provided
    let materialsUrl: string | undefined;
    if (materials) {
      materialsUrl = await this.minioService.getUploadedFilePath(materials);
    }

    const booking = this.bookingRepository.create({
      student: student,
      tutor,
      sessionType: bookingRequestDto.sessionType,
      sessionDate: bookingRequestDto.selectedDate,
      sessionTime: bookingRequestDto.selectedTimeSlot,
      creditsUsed: bookingRequestDto.creditsToUse,
      materialsUrl,
      description: bookingRequestDto.description,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);
    student.credits -= bookingRequestDto.creditsToUse;
    await this.userService.save(student);
    return savedBooking;
  }

  private async isTimeSlotAvailable(
    tutorId: string,
    date: string,
    time: string,
  ): Promise<boolean> {
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        tutor: { id: tutorId },
        sessionDate: date,
        sessionTime: time,
        status: In([BookingStatus.PENDING, BookingStatus.APPROVED]),
      },
    });

    return !existingBooking;
  }

  async getStudentBookings(studentId: string): Promise<Booking[]> {
    const student = await this.userService.findOne(studentId);

    if (!student) {
      this.exceptionHandler.throwNotFound(_404.STUDENT_NOT_FOUND);
    }

    return this.bookingRepository.find({
      where: { student: { id: student.id } },
      relations: ['tutor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTutorBookings(tutorId: string): Promise<Booking[]> {
    const tutor = await this.userService.findOne(tutorId);

    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    return this.bookingRepository.find({
      where: { tutor: { id: tutor.id } },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    user: User,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['student', 'tutor', 'tutor.profile'],
    });

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    // Check if the tutor is the owner of the booking
    if (booking.tutor.id !== user.id) {
      this.exceptionHandler.throwForbidden(_403.UNAUTHORIZED_TO_UPDATE_BOOKING);
    }

    if (
      (status === BookingStatus.REJECTED ||
        status === BookingStatus.CANCELLED) &&
      booking.status === BookingStatus.PENDING
    ) {
      const studentRecord: User = await this.userService.findOne(
        booking.student.id,
      );
      if (studentRecord) {
        studentRecord.credits += booking.creditsUsed;
        await this.userService.save(studentRecord);
      }
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getSessionDetails(bookingId: string): Promise<SessionDetailsDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['tutor', 'tutor.portfolio', 'student', 'student.portfolio'],
    });

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    // Get the timeline events
    const timeline: TimelineEvent[] = [
      {
        action: 'Session request submitted to tutor',
        timestamp: booking.createdAt,
        by: `${booking.student.firstName} ${booking.student.lastName}`,
      },
    ];

    if (booking.status === BookingStatus.APPROVED) {
      timeline.push({
        action: 'Tutor accepted session',
        timestamp: booking.updatedAt,
        by: `${booking.tutor.firstName} ${booking.tutor.lastName}`,
      });
    } else if (booking.status === BookingStatus.REJECTED) {
      timeline.push({
        action: 'Tutor rejected session',
        timestamp: booking.updatedAt,
        by: `${booking.tutor.firstName} ${booking.tutor.lastName}`,
      });
    }

    // Format the session details
    const sessionDetails: SessionDetailsDto = {
      id: booking.id,
      sessionDate: booking.sessionDate,
      sessionTime: booking.sessionTime,
      timezone: booking.tutor.portfolio.timezone || 'UTC',
      tutor: {
        id: booking.tutor.id,
        name: `${booking.tutor.firstName} ${booking.tutor.lastName.charAt(0)}.`,
        university: booking.tutor.portfolio.university,
        profilePicture: booking.tutor.profilePicture,
        countryCode: booking.tutor.portfolio.countriesOfCitizenship?.[0] || '',
      },
      student: {
        id: booking.student.id,
        name: `${booking.student.firstName} ${booking.student.lastName}`,
        email: booking.student.email,
        profilePicture: booking.student.profilePicture,
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

    return sessionDetails;
  }
}
