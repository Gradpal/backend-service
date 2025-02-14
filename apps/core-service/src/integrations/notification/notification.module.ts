import {
  NOTIFICATION_QUEUE_NAMES,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationPreProcessor } from './notification.preprocessor';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { createQueueProvider } from '@app/common/rabbitmq/queue.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: QUEUE_HANDLERS.EMAIL,
      useFactory: (configService: CoreServiceConfigService) =>
        createQueueProvider(
          NOTIFICATION_QUEUE_NAMES.EMAIL,
          configService.rabbitmqUri,
        ),
      inject: [CoreServiceConfigService],
    },
    {
      provide: QUEUE_HANDLERS.PLATFORM,
      useFactory: (configService: CoreServiceConfigService) =>
        createQueueProvider(
          NOTIFICATION_QUEUE_NAMES.PLATFORM,
          configService.rabbitmqUri,
        ),
      inject: [CoreServiceConfigService],
    },
    NotificationService,
    NotificationPreProcessor,
  ],
  exports: [
    QUEUE_HANDLERS.EMAIL,
    QUEUE_HANDLERS.PLATFORM,
    NotificationService,
    NotificationPreProcessor,
  ],
})
export class NotificationModule {}
