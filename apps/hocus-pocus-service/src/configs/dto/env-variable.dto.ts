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
  HOCUS_POCUS_SERVICE_PORT: number;
  @Expose()
  GRPC_URL: string;

  @Expose()
  HOCUS_POCUS_SERVER_PORT: number;
}
