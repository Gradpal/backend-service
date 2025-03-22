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
import { _400, _409 } from '@app/common/constants/errors-constants';
import { BrainService } from '@app/common/brain/brain.service';
import { plainToClass } from 'class-transformer';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { USER_BY_EMAIL_CACHE } from '@core-service/common/constants/brain.constants';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
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
      ...studentDto,
      profile: user,
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

  async saveStudent(user: User) {
    const student = await this.studentRepository.create({
      profile: user,
    });
    return await this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({ relations: ['profile'] });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      relations: ['profile'],
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
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
}
