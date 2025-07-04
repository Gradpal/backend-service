import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_ROOT_NAMES } from '../../common/constants/typeorm-config.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message], DB_ROOT_NAMES.CHAT),
    TypeOrmModule.forFeature([Conversation, Message], DB_ROOT_NAMES.DEFAULT),
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
