import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { validateEnvironmentVariables } from './validation';
import { NotificationConfigService } from './notification-config.service';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/notification-service/.env',
    }),
  ],
  providers: [ConfigService, NotificationConfigService],
  exports: [ConfigService, NotificationConfigService],
})
export class NotificationConfigModule {}
