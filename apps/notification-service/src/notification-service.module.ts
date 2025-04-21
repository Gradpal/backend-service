import { Module } from '@nestjs/common';
import { EmailNotifierModule } from './modules/email-notifier/email-notifier.module';
import { NotificationConfigModule } from './configs/notification-config.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { PlatformHandlerModule } from './modules/platform-notifier/platform-notifier.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationConfigService } from './configs/notification-config.service';
import { NotificationModule } from './modules/notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { createMailerConfig } from './configs/mailer.config';
import { SlackModule } from './modules/slack/slack.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [NotificationConfigModule],
      inject: [NotificationConfigService],
      useFactory: async (appConfigService: NotificationConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createMailerConfig,
      inject: [NotificationConfigService],
    }),
    NotificationConfigModule,
    EmailNotifierModule,
    LoggerModule,
    HealthModule,
    ExceptionModule,
    PlatformHandlerModule,
    NotificationModule,
    SlackModule,
  ],
  controllers: [],
  providers: [],
})
export class NotificationServiceModule {}
