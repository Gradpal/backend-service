import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class BrainModuleOptions {
  @IsString()
  @IsNotEmpty()
  appPrefix: string;

  @ValidateNested()
  @IsNotEmpty()
  redisConfig: RedisModuleOptions;
}

export class ForRootAsyncOptions {
  useFactory: (
    ...args: any[] // at this point we don't know the type of the arguments.
  ) => Promise<BrainModuleOptions> | BrainModuleOptions;
  inject?: any[];
}
