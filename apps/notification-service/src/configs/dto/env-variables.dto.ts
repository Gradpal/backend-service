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
  NOTIFICATION_SERVICE_PORT: number;

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
  SMTP_USER: string;

  @Expose()
  RABBITMQ_URI: string;

  @Expose()
  SMTP_EMAIL: string;

  @Expose()
  SMTP_PASSWORD: string;

  @Expose()
  JWT_SECRET: string;

  @Expose()
  JWT_EXPIRES_IN: string;

  @Expose()
  CHAT_DB_NAME: string;
}
