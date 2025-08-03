import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_ROOT_NAMES } from '../../common/constants/typeorm-config.constant';
import { NotificationConfigService } from '@notification-service/configs/notification-config.service';
import { createQueueProvider } from '@app/common/rabbitmq/queue.provider';
import {
  NOTIFICATION_QUEUE_NAMES,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { PlatformChattingModule } from './platform-chatting/platform-chatting.module';
import { NotificationUserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message], DB_ROOT_NAMES.CHAT),
    PlatformChattingModule,
    NotificationUserModule,
  ],
  providers: [
    ChatService,
    {
      provide: QUEUE_HANDLERS.MESSAGE,
      useFactory: (notificationConfigService: NotificationConfigService) =>
        createQueueProvider(
          NOTIFICATION_QUEUE_NAMES.MESSAGE,
          notificationConfigService.rabbitmqUri,
        ),
      inject: [NotificationConfigService],
    },
  ],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
