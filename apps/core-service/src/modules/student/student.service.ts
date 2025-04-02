import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto'; // Assuming you have a DTO for creating a student
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { _400, _409, _404 } from '@app/common/constants/errors-constants';
import { BrainService } from '@app/common/brain/brain.service';
import { plainToClass } from 'class-transformer';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { USER_BY_EMAIL_CACHE } from '@core-service/common/constants/brain.constants';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { SavedTutor } from './entities/saved-tutor.entity';
import { Tutor } from '../tutor/entities/tutor.entity';
import {
  StudentDashboardResponseDto,
  DashboardStatsDto,
  SavedTutorDto,
  UpcomingAppointmentDto,
  ScheduleEventDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SavedTutor)
    private readonly savedTutorRepository: Repository<SavedTutor>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly configService: CoreServiceConfigService,
  ) {}

  async findCachedUser(email: string) {
    const cacheKey = `${USER_BY_EMAIL_CACHE.name}:${email}`;
    const cachedUser =
      await this.brainService.remindMe<CreateUserDTO>(cacheKey);
    if (cachedUser) return cachedUser;

    return cachedUser;
  }

  async verifyProfile(otp: number, email: string) {
    const isValidOtp = await this.brainService.verifyOTP(email, otp);
    if (!isValidOtp) this.exceptionHandler.throwBadRequest(_400.INVALID_OTP);

    const studentDto: CreateStudentDto = await this.findCachedUser(email);
    const userDto = new CreateUserDTO();
    Object.assign(userDto, studentDto);
    const user = await this.userService.create(
      userDto,
      studentDto.profilePicture,
    );

    const student = this.studentRepository.create({
      profileId: user.id,
      profile: user,
      credits: studentDto.credits || 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (studentDto.referralCode) {
      // student.referer = await this.userService.findByReferalCode(
      //   studentDto.referralCode,
      // );
    }
    let studentEntity = this.studentRepository.create(studentDto);

    studentEntity.profile = user;
    studentEntity = await this.studentRepository.save(studentEntity);
    return plainToClass(Student, studentEntity);
  }

  private async cacheStudent(student: CreateUserDTO, otp?: string) {
    const cacheKey = this.brainService.getCacheKey(student.email);
    await Promise.all([
      this.brainService.memorize<CreateUserDTO>(
        cacheKey,
        student,
        USER_BY_EMAIL_CACHE.ttl,
      ),
      this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.VERIFICATION,
        [student?.email],
        {
          otpValidityDuration: 3,
          otp: otp,
          userName: student?.userName,
          verificationUrl: `${this.configService.clientUrl}user/verify-email/?otp=${otp}&email=${student?.email}`,
        },
      ),
    ]);
  }
  async create(
    createStudentDto: CreateStudentDto,
    profilePicture?: Express.Multer.File,
  ) {
    const profileExists = await this.userService.existByEmail(
      createStudentDto.email,
    );
    if (profileExists) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    createStudentDto.profilePicture = profilePicture;
    this.cacheStudent(createStudentDto);
  }

  async saveStudent(user: User): Promise<Student> {
    const student = this.studentRepository.create({
      profileId: user.id,
      profile: user,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({ relations: ['profile'] });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!student) {
      this.exceptionHandler.throwNotFound(_404.STUDENT_NOT_FOUND);
    }
    return student;
  }

  async findByProfileId(profileId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { profileId },
      relations: ['profile'],
    });
    if (!student) {
      this.exceptionHandler.throwNotFound(_404.STUDENT_NOT_FOUND);
    }
    return student;
  }

  async updateProfile(
    id: string,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ): Promise<Student> {
    const student = await this.findOne(id);

    // Handle visibility settings for religious affiliation
    if (updateStudentProfileDto.religious_affiliation) {
      student.religious_affiliation = {
        value: updateStudentProfileDto.religious_affiliation,
        visible: updateStudentProfileDto.religious_affiliation_visible || false,
      };
    }

    // Handle visibility settings for gender
    if (updateStudentProfileDto.gender) {
      student.gender = {
        value: updateStudentProfileDto.gender,
        visible: updateStudentProfileDto.gender_visible || false,
      };
    }

    // Update other fields
    if (updateStudentProfileDto.country_of_residence) {
      student.country_of_residence =
        updateStudentProfileDto.country_of_residence;
    }
    if (updateStudentProfileDto.current_timezone) {
      student.current_timezone = updateStudentProfileDto.current_timezone;
    }
    if (updateStudentProfileDto.timezone_display_format) {
      student.timezone_display_format =
        updateStudentProfileDto.timezone_display_format;
    }

    // Update calendar tokens
    if (updateStudentProfileDto.apple_calendar_token) {
      student.apple_calendar_token =
        updateStudentProfileDto.apple_calendar_token;
    }
    if (updateStudentProfileDto.google_calendar_token) {
      student.google_calendar_token =
        updateStudentProfileDto.google_calendar_token;
    }

    student.updated_at = new Date();
    return await this.studentRepository.save(student);
  }

  async linkCalendar(
    id: string,
    calendarType: 'apple' | 'google',
    token: string,
  ): Promise<Student> {
    const student = await this.findOne(id);

    if (calendarType === 'apple') {
      student.apple_calendar_token = token;
    } else {
      student.google_calendar_token = token;
    }

    student.updated_at = new Date();
    return await this.studentRepository.save(student);
  }

  async unlinkCalendar(
    id: string,
    calendarType: 'apple' | 'google',
  ): Promise<Student> {
    const student = await this.findOne(id);

    if (calendarType === 'apple') {
      student.apple_calendar_token = null;
    } else {
      student.google_calendar_token = null;
    }

    student.updated_at = new Date();
    return await this.studentRepository.save(student);
  }

  async update(
    id: string,
    updateStudentDto: CreateStudentDto,
  ): Promise<Student> {
    const student = await this.findOne(id);
    const updatedStudent = Object.assign(student, updateStudentDto);
    return this.studentRepository.save(updatedStudent);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async getDashboardData(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StudentDashboardResponseDto> {
    const student = await this.findByProfileId(userId);

    // Fetch all data in parallel for better performance
    const [stats, upcomingAppointments, schedule, savedTutors] =
      await Promise.all([
        this.getDashboardStats(student.id),
        this.getUpcomingAppointments(userId),
        this.getSchedule(userId, startDate, endDate),
        this.getSavedTutors(userId),
      ]);

    return {
      stats,
      credits: student.credits,
      upcomingAppointments,
      schedule,
      savedTutors,
    };
  }

  private async getDashboardStats(
    studentId: string,
  ): Promise<DashboardStatsDto> {
    // TODO: Implement actual stats calculation from sessions/conversations
    return {
      totalStudents: 25,
      totalSessions: 25,
      conversationRate: 25,
      responseRate: 25,
    };
  }

  async getWalletBalance(userId: string): Promise<number> {
    const student = await this.findByProfileId(userId);
    return student.credits;
  }

  private async getUpcomingAppointments(
    userId: string,
  ): Promise<UpcomingAppointmentDto[]> {
    // TODO: Implement actual appointments fetch from sessions
    return [
      {
        id: '1',
        tutorName: 'Alicia Keys',
        tutorAvatar: 'https://example.com/avatar.jpg',
        startTime: new Date('2025-03-22T10:00:00Z'),
        endTime: new Date('2025-03-22T12:00:00Z'),
        subject: 'Math Class',
      },
    ];
  }

  private async getSchedule(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ScheduleEventDto[]> {
    // TODO: Implement schedule fetch from sessions
    return [
      {
        id: '1',
        title: 'Math Class',
        type: 'single',
        tutorName: 'Valens N.',
        tutorAvatar: 'https://example.com/avatar.jpg',
        startTime: new Date('2025-03-22T10:00:00Z'),
        endTime: new Date('2025-03-22T12:00:00Z'),
        subject: 'Math',
      },
    ];
  }

  private async getSavedTutors(userId: string): Promise<SavedTutorDto[]> {
    const savedTutors = await this.savedTutorRepository.find({
      where: { studentId: userId },
      relations: ['tutor', 'tutor.profile'],
    });

    return savedTutors.map((savedTutor) => new SavedTutorDto(savedTutor.tutor));
  }

  async saveTutor(userId: string, tutorId: string): Promise<void> {
    const student = await this.findByProfileId(userId);
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
    });

    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }

    const savedTutor = this.savedTutorRepository.create({
      studentId: student.id,
      tutorId: tutor.id,
    });

    await this.savedTutorRepository.save(savedTutor);
  }

  async unsaveTutor(userId: string, tutorId: string): Promise<void> {
    const student = await this.findByProfileId(userId);
    await this.savedTutorRepository.delete({
      studentId: student.id,
      tutorId: tutorId,
    });
  }
}
