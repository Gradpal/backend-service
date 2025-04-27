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

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let testUser: User;
  let authToken: string;

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
        password: hashedPass,
        role: EUserRole.STUDENT,
        status: EUserStatus.ACTIVE,
        countryOfResidence: 'USA',
        phone_number: '+1234567890',
        userName: 'testuser',
      });

      authToken = jwtService.sign({
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
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

  describe('GET /users/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
      });
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });
  });

  describe('PATCH /users/profile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone_number: '+1987654321',
    };

    it('should update user profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .send(updateData)
        .expect(401);
    });
  });

  describe('PATCH /users/change-password', () => {
    const changePasswordData = {
      currentPassword: 'testPassword123',
      newPassword: 'newPassword123!',
    };

    it('should change password', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Password changed successfully',
      });

      // Verify can login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: changePasswordData.newPassword,
        })
        .expect(200);
    });

    it('should return 401 with incorrect current password', async () => {
      const invalidData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123!',
      };

      await request(app.getHttpServer())
        .patch('/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(401);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .patch('/users/change-password')
        .send(changePasswordData)
        .expect(401);
    });
  });

  describe('POST /users/upload-profile-picture', () => {
    it('should upload profile picture', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-picture')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake image data'), 'test.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('profilePicture');
      expect(response.body.profilePicture).toMatch(/^https?:\/\/.+/);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/users/upload-profile-picture')
        .attach('file', Buffer.from('fake image data'), 'test.jpg')
        .expect(401);
    });

    it('should return 400 without file', async () => {
      await request(app.getHttpServer())
        .post('/users/upload-profile-picture')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /users/referral-stats', () => {
    it('should get referral stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/referral-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalReferrals');
      expect(response.body).toHaveProperty('activeReferrals');
      expect(response.body).toHaveProperty('referralCode');
      expect(response.body.referralCode).toBe(testUser.referalCode);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/users/referral-stats')
        .expect(401);
    });
  });
});
