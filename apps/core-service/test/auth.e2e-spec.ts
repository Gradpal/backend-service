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
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EUserStatus } from '../src/modules/user/enums/user-status.enum';
import { hashPassword } from '../src/common/helpers/all.helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let testUser: User;

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
          entities: [User],
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
        TypeOrmModule.forFeature([User]),
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
            sub: testUser?.id,
            email: testUser?.email,
            role: testUser?.role,
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

    try {
      const hashedPass = await hashPassword('testPassword123');
      // Create test user
      testUser = await userRepository.save({
        email: 'test.user@example.com',
        firstName: 'Test',
        lastName: 'User',
        userName: 'testuser',
        password: await hashPassword('password123'),
        role: EUserRole.STUDENT,
        status: EUserStatus.ACTIVE,
        country_of_residence: 'USA',
        phone_number: '+1234567890',
        profilePicture: 'https://example.com/default-profile.jpg',
      });
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (userRepository) await userRepository.delete({});
      await app.close();
    } catch (error) {
      console.error('Error in test cleanup:', error);
    }
  });

  describe('POST /auth/register', () => {
    const registerData = {
      email: 'new.user@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
      role: EUserRole.STUDENT,
    };

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toMatchObject({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        status: EUserStatus.NOT_VERIFIED,
      });
    });

    it('should return 400 if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const loginData = {
      email: 'test.user@example.com',
      password: 'testPassword123',
    };

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 with invalid credentials', async () => {
      const invalidLoginData = {
        email: loginData.email,
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(401);
    });
  });

  describe('POST /auth/verify-email', () => {
    const verifyData = {
      email: 'test.user@example.com',
      otp: 123456,
    };

    it('should verify user email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send(verifyData)
        .expect(200);

      expect(response.body).toMatchObject({
        status: EUserStatus.ACTIVE,
      });
    });

    it('should return 400 with invalid verification code', async () => {
      const invalidVerifyData = {
        email: verifyData.email,
        otp: 999999,
      };

      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send(invalidVerifyData)
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    const forgotPasswordData = {
      email: 'test.user@example.com',
    };

    it('should send password reset email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Password reset email sent',
      });
    });

    it('should return 404 for non-existent email', async () => {
      const invalidData = {
        email: 'nonexistent@example.com',
      };

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(invalidData)
        .expect(404);
    });
  });

  describe('POST /auth/reset-password', () => {
    const resetPasswordData = {
      email: 'test.user@example.com',
      token: 'test.jwt.token',
      newPassword: 'NewPassword123!',
    };

    it('should reset password with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Password reset successfully',
      });

      // Verify can login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: resetPasswordData.email,
          password: resetPasswordData.newPassword,
        })
        .expect(200);
    });

    it('should return 400 with invalid token', async () => {
      const invalidData = {
        ...resetPasswordData,
        token: 'invalid.token',
      };

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(invalidData)
        .expect(400);
    });
  });
});
