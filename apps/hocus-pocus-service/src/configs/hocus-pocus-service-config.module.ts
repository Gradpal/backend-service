import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config-validation';
import { HocusPocusServiceConfigService } from './hosus-pocus-service-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/hocus-pocus-service/.env',
    }),
  ],
  providers: [ConfigService, HocusPocusServiceConfigService],
  exports: [ConfigService, HocusPocusServiceConfigService],
})
export class HocusPocusServiceConfigModule {}
