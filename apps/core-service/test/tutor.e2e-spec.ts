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

describe('TutorController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let tutorRepository: Repository<Tutor>;
  let bookingRepository: Repository<Booking>;
  let testTutorUser: User;
  let testTutor: Tutor;
  let testTutorAuthToken: string;
  let testStudentUser: User;
  let testStudentAuthToken: string;

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
          entities: [User, Tutor, Booking, Student],
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
        TypeOrmModule.forFeature([User, Tutor, Booking, Student]),
        CoreServiceModule,
      ],
    })
      .overrideProvider(JwtService)
      .useValue({
        sign: (payload: any) => {
          return 'test.jwt.token';
        },
        verify: (token: string) => {
          return {
            sub: testTutorUser?.id,
            email: testTutorUser?.email,
            role: testTutorUser?.role,
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
    bookingRepository = moduleFixture.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );

    try {
      // Create test tutor user
      testTutorUser = await userRepository.save({
        email: 'test.tutor@example.com',
        firstName: 'Test',
        lastName: 'Tutor',
        password: 'hashedPassword',
        role: EUserRole.TUTOR,
        isVerified: true,
        country_of_residence: 'Rwanda',
        profilePicture: 'https://example.com/tutor.jpg',
        userCode: 'TUT123',
        lastSeen: new Date(),
        referalCode: 'TEST456',
      });

      // Create test tutor
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

      // Create test student user
      testStudentUser = await userRepository.save({
        email: 'test.student@example.com',
        firstName: 'Test',
        lastName: 'Student',
        password: 'hashedPassword',
        role: EUserRole.STUDENT,
        isVerified: true,
        country_of_residence: 'USA',
        profilePicture: 'https://example.com/student.jpg',
        userCode: 'STU123',
        lastSeen: new Date(),
        referalCode: 'TEST123',
      });

      // Generate JWT tokens
      testTutorAuthToken = jwtService.sign({
        sub: testTutorUser.id,
        email: testTutorUser.email,
        role: testTutorUser.role,
      });

      testStudentAuthToken = jwtService.sign({
        sub: testStudentUser.id,
        email: testStudentUser.email,
        role: testStudentUser.role,
      });
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (bookingRepository) await bookingRepository.delete({});
      if (tutorRepository) await tutorRepository.delete({});
      if (userRepository) await userRepository.delete({});
      await app.close();
    } catch (error) {
      console.error('Error in test cleanup:', error);
    }
  });

  describe('GET /tutors', () => {
    it('should return all tutors', async () => {
      const response = await request(app.getHttpServer())
        .get('/tutors')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toMatchObject({
        id: testTutor.id,
        university: testTutor.university,
        isVerified: testTutor.isVerified,
        timezone: testTutor.timezone,
        languages: testTutor.languages,
        session_type: testTutor.session_type,
        academic_subjects: testTutor.academic_subjects,
      });
    });
  });

  describe('GET /tutors/:id', () => {
    it('should return tutor details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tutors/${testTutor.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testTutor.id,
        university: testTutor.university,
        isVerified: testTutor.isVerified,
        timezone: testTutor.timezone,
        languages: testTutor.languages,
        session_type: testTutor.session_type,
        academic_subjects: testTutor.academic_subjects,
        profile: {
          id: testTutorUser.id,
          firstName: testTutorUser.firstName,
          lastName: testTutorUser.lastName,
          email: testTutorUser.email,
          profilePicture: testTutorUser.profilePicture,
        },
      });
    });

    it('should return 404 for non-existent tutor', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/tutors/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /tutors/:id', () => {
    it('should update tutor profile', async () => {
      const updateData = {
        university: 'MIT',
        timezone: 'EST',
        languages: { value: ['English', 'French'], visible: true },
        session_type: ['One-on-one', 'Group'],
        academic_subjects: ['Math', 'Physics'],
      };

      const response = await request(app.getHttpServer())
        .put(`/tutors/${testTutor.id}`)
        .set('Authorization', `Bearer ${testTutorAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testTutor.id,
        ...updateData,
      });
    });

    it('should return 401 if not authenticated', async () => {
      const updateData = {
        university: 'MIT',
      };

      await request(app.getHttpServer())
        .put(`/tutors/${testTutor.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 403 if not the tutor owner', async () => {
      const updateData = {
        university: 'MIT',
      };

      await request(app.getHttpServer())
        .put(`/tutors/${testTutor.id}`)
        .set('Authorization', `Bearer ${testTutorAuthToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('POST /tutors/verify', () => {
    it('should verify tutor', async () => {
      const response = await request(app.getHttpServer())
        .post('/tutors/verify')
        .set('Authorization', `Bearer ${testTutorAuthToken}`)
        .send({
          university: 'Stanford University',
          degree: 'Bachelor of Science',
          graduationYear: 2020,
          documents: ['document1.pdf', 'document2.pdf'],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Verification request submitted successfully',
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tutors/verify')
        .send({
          university: 'Stanford University',
          degree: 'Bachelor of Science',
          graduationYear: 2020,
          documents: ['document1.pdf', 'document2.pdf'],
        })
        .expect(401);
    });
  });

  describe('GET /tutors/availability', () => {
    it('should return tutor availability', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tutors/${testTutor.id}/availability`)
        .query({
          date: new Date().toISOString().split('T')[0],
        })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('timeSlot');
      expect(response.body[0]).toHaveProperty('isAvailable');
    });

    it('should return 404 for non-existent tutor', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/tutors/${nonExistentId}/availability`)
        .query({
          date: new Date().toISOString().split('T')[0],
        })
        .expect(404);
    });
  });

  describe('GET /tutors/bookings', () => {
    it('should return tutor bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/tutors/bookings')
        .set('Authorization', `Bearer ${testTutorAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/tutors/bookings').expect(401);
    });

    it('should return 403 if user is not a tutor', async () => {
      await request(app.getHttpServer())
        .get('/tutors/bookings')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(403);
    });
  });

  describe('GET /tutors/earnings', () => {
    it('should return tutor earnings', async () => {
      const response = await request(app.getHttpServer())
        .get('/tutors/earnings')
        .set('Authorization', `Bearer ${testTutorAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEarnings');
      expect(response.body).toHaveProperty('monthlyEarnings');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/tutors/earnings').expect(401);
    });

    it('should return 403 if user is not a tutor', async () => {
      await request(app.getHttpServer())
        .get('/tutors/earnings')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(403);
    });
  });

  describe('GET /tutors/ratings', () => {
    it('should return tutor ratings', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tutors/${testTutor.id}/ratings`)
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('totalRatings');
      expect(response.body).toHaveProperty('reviews');
    });

    it('should return 404 for non-existent tutor', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/tutors/${nonExistentId}/ratings`)
        .expect(404);
    });
  });
});
