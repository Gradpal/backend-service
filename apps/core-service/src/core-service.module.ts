import { UserModule } from './modules/user/user.module';
import { CoreServiceConfigModule } from './configs/core-service-config.module';
import { CoreServiceConfigService } from './configs/core-service-config.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { RolesGuard } from './guards/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './integrations/notification/notification.module';
import { MinioClientModule } from './modules/minio-client/minio-client.module';
import { REDIS_CONST } from './common/constants/all.constants';
import { BrainModule } from '@app/common/brain/brain.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { StudentController } from './modules/student/student.controller';
import { StudentModule } from './modules/student/student.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ClassSessionModule } from './modules/class-session/class-session.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [
    CoreServiceConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CoreServiceConfigModule],
      inject: [CoreServiceConfigService],
      useFactory: async (appConfigService: CoreServiceConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    BrainModule.forRootAsync({
      inject: [CoreServiceConfigService],
      useFactory: async (appConfigService: CoreServiceConfigService) => ({
        appPrefix: REDIS_CONST.APP_PREFIX,
        redisConfig: appConfigService.getRedisInfo(),
      }),
    }),
    LoggerModule,
    UserModule,
    HealthModule,
    ExceptionModule,
    AuthModule,
    JwtModule,
    NotificationModule,
    MinioClientModule,
    TutorModule,
    StudentModule,
    PaymentModule,
    ClassSessionModule,
    BookingModule,
  ],
  controllers: [StudentController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class CoreServiceModule {}
