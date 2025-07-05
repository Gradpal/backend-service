import { Module, forwardRef } from '@nestjs/common';
import { PlatformChattingService } from './platform-chatting.service';
import { PlatformChattingController } from './platform-chatting.controller';
import { ChatModule } from '../chat.module';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGatewayHandler } from '../../../websocket/gateway.socket';

@Module({
  imports: [JwtModule, forwardRef(() => ChatModule)],
  providers: [PlatformChattingService, WebSocketGatewayHandler],
  controllers: [PlatformChattingController],
})
export class PlatformChattingModule {}
