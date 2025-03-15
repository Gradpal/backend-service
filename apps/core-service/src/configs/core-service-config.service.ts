import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment, EnvironmentVariables } from './dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { MinioModuleOptions } from '@core-service/modules/minio-client/types/all.types';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class CoreServiceConfigService {
  // I couldn't find a better name for this class
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('CORE_SERVICE_PORT');
  }

  get environment(): AppEnvironment {
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

  get jwtSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.getOrThrow('JWT_EXPIRES_IN');
  }

  get dbSynchronize(): boolean {
    return this.configService.getOrThrow('DB_SYNCHRONIZE');
  }

  get rabbitmqUri(): string {
    return this.configService.getOrThrow('RABBITMQ_URI');
  }

  get rabbitMqNotificationsQueue(): string {
    return this.configService.getOrThrow('RABBIT_MQ_NOTIFICATIONS_QUEUE');
  }

  get GrpcHost(): string {
    return this.configService.getOrThrow('GRPC_HOST');
  }

  get GrpcPort(): number {
    return this.configService.getOrThrow('GRPC_PORT');
  }
  get minioPort(): string {
    return this.configService.getOrThrow('MINIO_PORT');
  }
  get minioAccessKey(): string {
    return this.configService.getOrThrow('MINIO_ACCESS_KEY');
  }
  get minioEndPoint(): string {
    return this.configService.getOrThrow('MINIO_ENDPOINT');
  }
  get minioSecretKey(): string {
    return this.configService.getOrThrow('MINIO_SECRET_KEY');
  }
  get minioBucket(): string {
    return this.configService.getOrThrow('MINIO_BUCKET');
  }
  get minioUsessl(): string {
    return this.configService.getOrThrow('MINIO_USE_SSL');
  }
  get clientUrl(): string {
    return this.configService.getOrThrow('CLIENT_URL');
  }

  get getRedisUrl(): string {
    return this.configService.getOrThrow('REDIS_URL');
  }

  get minioUrl(): string {
    return this.configService.getOrThrow('MINIO_URL');
  }
  get defaultPassword(): string {
    return this.configService.getOrThrow('DEFAULT_PASSWORD');
  }
  get getStripeSecretKey(): string {
    return this.configService.getOrThrow('STRIPE_SECRET_KEY')
  }
  get getStripeWebsookSecret(): string {
    return this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET')
  }

  STRIPE_WEBHOOK_SECRET

  getPostgresInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPass,
      database: this.dbName,
      migrations: ['dist/apps/core-service/db/migrations/**/*.js'],
      entities: ['dist/apps/core-service/**/*.entity.js'],
      synchronize: this.environment !== AppEnvironment.Production,
      migrationsRun: this.environment === AppEnvironment.Production,
      dropSchema: false,
      cache: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
  getRedisInfo(): RedisModuleOptions {
    return {
      type: 'single',
      url: this.getRedisUrl,
    } as RedisModuleOptions;
  }
  getMinioInfo(): MinioModuleOptions {
    return {
      endpoint: this.minioEndPoint,
      port: this.minioPort,
      accessKey: this.minioAccessKey,
      secretKey: this.minioSecretKey,
      bucket: this.minioBucket,
    };
  }
}
