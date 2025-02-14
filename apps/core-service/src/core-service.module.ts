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
import { IntegrationMicroserviceModule } from './integrations/integration-service/integrations.microservice.module';
import { MinioClientModule } from './modules/minio-client/minio-client.module';
import { REDIS_CONST } from './common/constants/all.constants';
import { BrainModule } from '@app/common/brain/brain.module';
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
    IntegrationMicroserviceModule,
    LoggerModule,
    UserModule,
    HealthModule,
    ExceptionModule,
    AuthModule,
    JwtModule,
    NotificationModule,
    MinioClientModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class CoreServiceModule {}
