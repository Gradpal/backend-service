import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CoreServiceModule } from '../src/core-service.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/modules/user/entities/user.entity';
import { Tutor } from '../src/modules/tutor/entities/tutor.entity';
import { Repository } from 'typeorm';
import { EUserRole } from '../src/modules/user/enums/user-role.enum';
import {
  Booking,
  BookingStatus,
} from '../src/modules/booking/entities/booking.entity';
import { Student } from '../src/modules/student/entities/student.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let tutorRepository: Repository<Tutor>;
  let studentRepository: Repository<Student>;
  let bookingRepository: Repository<Booking>;
  let studentAuthToken: string;
  let tutorAuthToken: string;
  let testStudent: Student;
  let testTutor: Tutor;
  let testStudentUser: User;
  let testTutorUser: User;
  let testBooking: Booking;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          entities: [User, Tutor, Student, Booking],
          synchronize: true,
          dropSchema: true,
          logging: true,
          migrations: [],
          migrationsRun: false,
          autoLoadEntities: true,
          keepConnectionAlive: true,
          retryAttempts: 3,
          retryDelay: 3000,
          namingStrategy: new SnakeNamingStrategy(),
        }),
        TypeOrmModule.forFeature([User, Tutor, Student, Booking]),
        CoreServiceModule,
      ],
    })
      .overrideProvider(JwtService)
      .useValue({
        sign: (payload: any) => {
          // Return different tokens for student and tutor
          return JSON.stringify(payload);
        },
        verify: (token: string) => {
          const payload = JSON.parse(token);
          return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            id: payload.sub,
          };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    tutorRepository = moduleFixture.get<Repository<Tutor>>(
      getRepositoryToken(Tutor),
    );
    studentRepository = moduleFixture.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
    bookingRepository = moduleFixture.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );

    try {
      // Create test users
      testStudentUser = await userRepository.save({
        email: 'test.student@example.com',
        firstName: 'Test',
        lastName: 'Student',
        password: 'hashedPassword',
        role: EUserRole.STUDENT,
        isVerified: true,
        country_of_residence: 'USA',
        profilePicture: 'https://example.com/default-profile.jpg',
        userCode: 'STU123',
        lastSeen: new Date(),
        referalCode: 'TEST123',
      });

      testTutorUser = await userRepository.save({
        email: 'test.tutor@example.com',
        firstName: 'Test',
        lastName: 'Tutor',
        password: 'hashedPassword',
        role: EUserRole.TUTOR,
        isVerified: true,
        country_of_residence: 'Rwanda',
        profilePicture: 'https://example.com/default-profile.jpg',
        userCode: 'TUT123',
        lastSeen: new Date(),
        referalCode: 'TEST456',
      });

      // Create test student and tutor
      testStudent = await studentRepository.save({
        profile: testStudentUser,
        credits: 100,
      });

      testTutor = await tutorRepository.save({
        profile: testTutorUser,
        university: 'Harvard University',
        isVerified: true,
        timezone: 'UTC',
        languages: { value: ['English'], visible: true },
        session_type: ['One-on-one'],
        academic_subjects: ['Math'],
        payment_info: { credits: 0 },
      });

      // Create test booking
      testBooking = await bookingRepository.save({
        tutor: testTutor,
        student: testStudent,
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: '14:00',
        sessionType: 'Math',
        status: BookingStatus.PENDING,
        creditsUsed: 10,
        description: 'Test session',
      });

      // Generate JWT tokens
      studentAuthToken = jwtService.sign({
        sub: testStudentUser.id,
        email: testStudentUser.email,
        role: testStudentUser.role,
      });

      tutorAuthToken = jwtService.sign({
        sub: testTutorUser.id,
        email: testTutorUser.email,
        role: testTutorUser.role,
      });
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (bookingRepository) await bookingRepository.delete({});
      if (studentRepository) await studentRepository.delete({});
      if (tutorRepository) await tutorRepository.delete({});
      if (userRepository) await userRepository.delete({});
      await app.close();
    } catch (error) {
      console.error('Error in test cleanup:', error);
    }
  });

  describe('POST /bookings', () => {
    it('should create a new booking', async () => {
      const bookingData = {
        tutorId: testTutor.id,
        selectedDate: new Date().toISOString().split('T')[0],
        selectedTimeSlot: '15:00',
        sessionType: 'Math',
        description: 'Need help with calculus',
        creditsToUse: 10,
      };

      console.log('Test data:', {
        studentId: testStudentUser.id,
        studentRecordId: testStudent.id,
        tutorId: testTutor.id,
        bookingData,
      });

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .send(bookingData);

      console.log('========', response);
      // .expect(201);

      console.log('Response:', response.body);

      expect(response.body).toMatchObject({
        tutor: expect.objectContaining({ id: testTutor.id }),
        student: expect.objectContaining({ id: testStudent.id }),
        sessionDate: bookingData.selectedDate,
        sessionTime: bookingData.selectedTimeSlot,
        sessionType: bookingData.sessionType,
        status: BookingStatus.PENDING,
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).post('/bookings').send({}).expect(401);
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return session details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testBooking.id,
        sessionDate: testBooking.sessionDate,
        sessionTime: testBooking.sessionTime + ':00',
        timezone: testTutor.timezone || 'UTC',
        tutor: {
          id: testTutor.id,
          name: `${testTutorUser.firstName} ${testTutorUser.lastName.charAt(0)}.`,
          university: testTutor.university,
          isVerified: testTutor.isVerified,
          profilePicture: testTutorUser.profilePicture,
          countryCode: testTutor.countries_of_citizenship?.[0] || '',
        },
        student: {
          id: testStudent.id,
          name: `${testStudentUser.firstName} ${testStudentUser.lastName}`,
          email: testStudentUser.email,
          profilePicture: testStudentUser.profilePicture,
        },
        subject: testBooking.sessionType,
        duration: '90 minutes',
        creditsUsed: testBooking.creditsUsed,
        communicationTool: {
          name: 'Gradpal Classroom',
          description:
            'Gradpal Classroom is the communication experience on the gradpal platform, where tutors interact with theirs students through a visual meeting',
        },
        documents: [],
        description: testBooking.description,
        timeline: expect.arrayContaining([
          expect.objectContaining({
            action: 'Session request submitted to tutor',
            by: `${testStudentUser.firstName} ${testStudentUser.lastName}`,
          }),
        ]),
        status: testBooking.status,
      });
    });

    it('should return 404 for non-existent booking', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID format
      await request(app.getHttpServer())
        .get(`/bookings/${nonExistentId}`)
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .expect(404);
    });
  });

  describe('GET /bookings/student', () => {
    it('should return student bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/student')
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toMatchObject({
        id: testBooking.id,
        sessionDate: testBooking.sessionDate,
        sessionTime: testBooking.sessionTime,
        sessionType: testBooking.sessionType,
      });
    });
  });

  describe('GET /bookings/tutor', () => {
    it('should return tutor bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/tutor')
        .set('Authorization', `Bearer ${tutorAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toMatchObject({
        id: testBooking.id,
        sessionDate: testBooking.sessionDate,
        sessionTime: testBooking.sessionTime,
        sessionType: testBooking.sessionType,
      });
    });
  });

  describe('PUT /bookings/:id/status', () => {
    it('should update booking status', async () => {
      const response = await request(app.getHttpServer())
        .put(`/bookings/${testBooking.id}/status`)
        .set('Authorization', `Bearer ${tutorAuthToken}`)
        .send({ status: BookingStatus.APPROVED })
        .expect(200);

      expect(response.body).toMatchObject({
        id: testBooking.id,
        status: BookingStatus.APPROVED,
      });
    });

    it('should return 403 if student tries to update status', async () => {
      await request(app.getHttpServer())
        .put(`/bookings/${testBooking.id}/status`)
        .set('Authorization', `Bearer ${studentAuthToken}`)
        .send({ status: BookingStatus.APPROVED })
        .expect(403);
    });
  });
});
