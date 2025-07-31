import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment, EnvironmentVariables } from './dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DB_ROOT_NAMES } from '../common/constants/typeorm-config.constant';

@Injectable()
export class NotificationConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('NOTIFICATION_SERVICE_PORT');
  }

  get environment(): string {
    return this.configService.getOrThrow('NODE_ENV');
  }

  get dbHost(): string {
    return this.configService.getOrThrow('DB_HOST');
  }

  get dbPort(): number {
    return this.configService.getOrThrow('DB_PORT');
  }

  get dbUser(): string {
    return this.configService.getOrThrow('DB_USER');
  }

  get dbPass(): string {
    return this.configService.getOrThrow('DB_PASS');
  }

  get dbName(): string {
    return this.configService.getOrThrow('DB_NAME');
  }
  get GrpcHost(): string {
    return this.configService.getOrThrow('GRPC_HOST');
  }

  get GrpcPort(): number {
    return this.configService.getOrThrow('GRPC_PORT');
  }

  get chatDbName(): string {
    return this.configService.getOrThrow('CHAT_DB_NAME');
  }

  get grpcUrl(): string {
    return this.configService.getOrThrow('GRPC_URL');
  }
  get coreGrpcUrl(): string {
    return this.configService.getOrThrow('CORE_GRPC_URL');
  }
  get rabbitmqUri(): string {
    return this.configService.getOrThrow('RABBITMQ_URI');
  }

  get smtpEmail(): string {
    return this.configService.getOrThrow('SMTP_EMAIL');
  }
  get smtpUser(): string {
    return this.configService.getOrThrow('SMTP_USER');
  }

  get smtpPassword(): string {
    return this.configService.getOrThrow('SMTP_PASSWORD');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.getOrThrow('JWT_EXPIRES_IN');
  }

  getPostgresInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPass,
      database: this.dbName,
      migrations: ['dist/apps/notification-service/db/migrations/**/*.js'],
      entities: ['dist/apps/notification-service/**/*.entity.js'],
      synchronize: this.environment !== AppEnvironment.Production,
      migrationsRun: this.environment === AppEnvironment.Production,
      dropSchema: false,
      cache: false,
      logging: false,
    };
  }

  getChatPostgresInfo(): TypeOrmModuleOptions {
    return {
      name: DB_ROOT_NAMES.CHAT,
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPass,
      database: this.chatDbName,
      migrations: ['dist/apps/notification-service/db/migrations/**/*.js'],
      entities: ['dist/apps/notification-service/**/*.entity.js'],
      synchronize: this.environment !== AppEnvironment.Production,
      migrationsRun: this.environment === AppEnvironment.Production,
      dropSchema: false,
      cache: false,
      logging: false,
    };
  }
}
