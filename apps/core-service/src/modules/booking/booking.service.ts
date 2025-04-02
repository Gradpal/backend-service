import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingRequestDto } from './dto/booking-request.dto';
import { SessionDetailsDto, TimelineEvent } from './dto/session-details.dto';
import { User } from '../user/entities/user.entity';
import { Tutor } from '../tutor/entities/tutor.entity';
import { Student } from '../student/entities/student.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400, _403 } from '@app/common/constants/errors-constants';
import { MinioClientService } from '../minio-client/minio-client.service';
import { EUserRole } from '../user/enums/user-role.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly minioService: MinioClientService,
  ) {}

  async createBooking(
    student: User,
    bookingRequestDto: BookingRequestDto,
    materials?: Express.Multer.File,
  ): Promise<Booking> {
    // Find tutor
    const tutor = await this.tutorRepository.findOne({
      where: { profile: { id: bookingRequestDto.tutorId } },
      relations: ['profile'],
    });
    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    // Find student record
    const studentRecord = await this.studentRepository.findOne({
      where: { profile: { id: student.id } },
    });
    if (!studentRecord) {
      this.exceptionHandler.throwNotFound(_404.STUDENT_NOT_FOUND);
    }

    // Verify student has enough credits
    if (studentRecord.credits < bookingRequestDto.creditsToUse) {
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
      materialsUrl = await this.minioService.uploadFile(materials);
    }

    // Create booking
    const booking = this.bookingRepository.create({
      student: studentRecord,
      tutor,
      sessionType: bookingRequestDto.sessionType,
      sessionDate: bookingRequestDto.selectedDate,
      sessionTime: bookingRequestDto.selectedTimeSlot,
      creditsUsed: bookingRequestDto.creditsToUse,
      materialsUrl,
      description: bookingRequestDto.description,
      status: BookingStatus.PENDING,
    });

    // Save booking
    const savedBooking = await this.bookingRepository.save(booking);

    // Deduct credits from student
    studentRecord.credits -= bookingRequestDto.creditsToUse;
    await this.studentRepository.save(studentRecord);

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
    // Find student record first
    const studentRecord = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!studentRecord) {
      this.exceptionHandler.throwNotFound(_404.STUDENT_NOT_FOUND);
    }

    return this.bookingRepository.find({
      where: { student: { id: studentRecord.id } },
      relations: ['tutor', 'tutor.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTutorBookings(tutorId: string): Promise<Booking[]> {
    // Find tutor record first
    const tutorRecord = await this.tutorRepository.findOne({
      where: { profile: { id: tutorId } },
    });

    if (!tutorRecord) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    return this.bookingRepository.find({
      where: { tutor: { id: tutorRecord.id } },
      relations: ['student', 'student.profile'],
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

    // If rejecting or cancelling, refund credits to student
    if (
      (status === BookingStatus.REJECTED ||
        status === BookingStatus.CANCELLED) &&
      booking.status === BookingStatus.PENDING
    ) {
      const studentRecord = await this.studentRepository.findOne({
        where: { profile: { id: booking.student.id } },
      });
      if (studentRecord) {
        studentRecord.credits += booking.creditsUsed;
        await this.studentRepository.save(studentRecord);
      }
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getSessionDetails(bookingId: string): Promise<SessionDetailsDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['tutor', 'tutor.profile', 'student', 'student.profile'],
    });

    if (!booking) {
      this.exceptionHandler.throwNotFound(_404.BOOKING_NOT_FOUND);
    }

    // Get the timeline events
    const timeline: TimelineEvent[] = [
      {
        action: 'Session request submitted to tutor',
        timestamp: booking.createdAt,
        by: `${booking.student.profile.firstName} ${booking.student.profile.lastName}`,
      },
    ];

    if (booking.status === BookingStatus.APPROVED) {
      timeline.push({
        action: 'Tutor accepted session',
        timestamp: booking.updatedAt,
        by: `${booking.tutor.profile.firstName} ${booking.tutor.profile.lastName}`,
      });
    } else if (booking.status === BookingStatus.REJECTED) {
      timeline.push({
        action: 'Tutor rejected session',
        timestamp: booking.updatedAt,
        by: `${booking.tutor.profile.firstName} ${booking.tutor.profile.lastName}`,
      });
    }

    // Format the session details
    const sessionDetails: SessionDetailsDto = {
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

    return sessionDetails;
  }
}
