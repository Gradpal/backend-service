import { Module } from '@nestjs/common';
import { NotificationConfigModule } from './configs/notification-config.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { PlatformHandlerModule } from './modules/notification/platform-notifier/platform-notifier.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationConfigService } from './configs/notification-config.service';
import { NotificationModule } from './modules/notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { createMailerConfig } from './configs/mailer.config';
import { SlackModule } from './modules/slack/slack.module';
import { ChatModule } from './modules/chat/chat.module';
import { DB_ROOT_NAMES } from './common/constants/typeorm-config.constant';
import { CoreServiceIntegrationModule } from './integrations/core-service/integrations.microservice.module';
import { EmailNotifierModule } from './modules/notification/email-notifier/email-notifier.module';
import { PlatformChattingModule } from './modules/chat/platform-chatting/platform-chatting.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [NotificationConfigModule],
      inject: [NotificationConfigService],
      useFactory: async (appConfigService: NotificationConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [NotificationConfigModule],
      inject: [NotificationConfigService],
      name: DB_ROOT_NAMES.CHAT,
      useFactory: async (appConfigService: NotificationConfigService) =>
        appConfigService.getChatPostgresInfo(),
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
    ChatModule,
    CoreServiceIntegrationModule,
    PlatformChattingModule,
  ],
  controllers: [],
  providers: [],
})
export class NotificationServiceModule {}
