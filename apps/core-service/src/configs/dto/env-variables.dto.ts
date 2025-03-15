import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum AppEnvironment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsEnum(AppEnvironment)
  NODE_ENV: AppEnvironment;

  @Expose()
  @IsNumber()
  CORE_SERVICE_PORT: number;

  @Expose()
  DB_HOST: string;

  @Expose()
  DB_PORT: number;

  @Expose()
  DB_USER: string;

  @Expose()
  DB_PASS: string;

  @Expose()
  DB_NAME: string;

  @Expose()
  JWT_SECRET: string;

  @Expose()
  DB_SYNCHRONIZE: boolean;

  @Expose()
  RABBITMQ_URI: string;

  @Expose()
  NOTIFICATIONS_PORT: number;

  @Expose()
  RABBIT_MQ_NOTIFICATIONS_QUEUE: string;

  @Expose()
  JWT_EXPIRES_IN: string;

  @Expose()
  GRPC_URL: string;

  @Expose()
  MINIO_ENDPOINT: string;

  @Expose()
  MINIO_PORT: string;

  @Expose()
  MINIO_ACCESS_KEY: string;

  @Expose()
  MINIO_SECRET_KEY: string;

  @Expose()
  MINIO_BUCKET: string;

  @Expose()
  MINIO_USE_SSL: string;

  @Expose()
  MINIO_URL: string;

  @Expose()
  REDIS_URL: string;

  @Expose()
  CLIENT_URL: string;

  @Expose()
  GRPC_HOST: string;

  @Expose()
  GRPC_PORT: number;
  @Expose()
  DEFAULT_PASSWORD: string;
  @Expose()
  STRIPE_SECRET_KEY:string;
  @Expose()
  STRIPE_WEBHOOK_SECRET:string;
}
