import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CoreServiceModule } from '../src/core-service.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { EUserRole } from '../src/modules/user/enums/user-role.enum';
import { Student } from '../src/modules/student/entities/student.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EUserStatus } from '../src/modules/user/enums/user-status.enum';
import { hashPassword } from '../src/common/helpers/all.helpers';

describe('StudentController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let studentRepository: Repository<Student>;
  let testStudentUser: User;
  let testStudent: Student;
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
          entities: [User, Student],
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
        TypeOrmModule.forFeature([User, Student]),
        CoreServiceModule,
      ],
    })
      .overrideProvider(JwtService)
      .useValue({
        sign: (payload: any) => {
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
    studentRepository = moduleFixture.get<Repository<Student>>(
      getRepositoryToken(Student),
    );

    try {
      // Create test student user
      testStudentUser = await userRepository.save({
        email: 'test.student@example.com',
        firstName: 'Test',
        lastName: 'Student',
        password: await hashPassword('testPassword123'),
        role: EUserRole.STUDENT,
        status: EUserStatus.ACTIVE,
        countryOfResidence: 'USA',
        phone_number: '+1234567890',
        userCode: 'STU123',
        profilePicture: 'https://example.com/default-profile.jpg',
      });

      // Create test student
      testStudent = await studentRepository.save({
        profileId: testStudentUser.id,
        credits: 100,
        countryOfResidence: 'USA',
        current_timezone: 'UTC',
        timezone_display_format: '24h',
        religious_affiliation: 'None',
        gender: 'Not specified',
      });

      // Generate JWT token
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
      if (studentRepository) await studentRepository.delete({});
      if (userRepository) await userRepository.delete({});
      await app.close();
    } catch (error) {
      console.error('Error in test cleanup:', error);
    }
  });

  describe('GET /students/:id', () => {
    it('should return student details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/students/${testStudent.id}`)
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testStudent.id,
        credits: testStudent.credits,
        profile: {
          id: testStudentUser.id,
          firstName: testStudentUser.firstName,
          lastName: testStudentUser.lastName,
          email: testStudentUser.email,
          profilePicture: testStudentUser.profilePicture,
        },
      });
    });

    it('should return 404 for non-existent student', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/students/${nonExistentId}`)
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(404);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/students/${testStudent.id}`)
        .expect(401);
    });
  });

  describe('GET /students/credits', () => {
    it('should return student credits', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/credits')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        credits: testStudent.credits,
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/students/credits').expect(401);
    });
  });

  describe('POST /students/purchase-credits', () => {
    it('should purchase credits', async () => {
      const purchaseData = {
        amount: 50,
        paymentMethod: 'credit_card',
        cardDetails: {
          number: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvc: '123',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/students/purchase-credits')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .send(purchaseData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Credits purchased successfully',
        newBalance: testStudent.credits + purchaseData.amount,
      });
    });

    it('should return 401 if not authenticated', async () => {
      const purchaseData = {
        amount: 50,
        paymentMethod: 'credit_card',
        cardDetails: {
          number: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvc: '123',
        },
      };

      await request(app.getHttpServer())
        .post('/students/purchase-credits')
        .send(purchaseData)
        .expect(401);
    });
  });

  describe('GET /students/learning-history', () => {
    it('should return student learning history', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/learning-history')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/students/learning-history')
        .expect(401);
    });
  });

  describe('GET /students/favorite-tutors', () => {
    it('should return student favorite tutors', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/favorite-tutors')
        .set('Authorization', `Bearer ${testStudentAuthToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/students/favorite-tutors')
        .expect(401);
    });
  });
});
