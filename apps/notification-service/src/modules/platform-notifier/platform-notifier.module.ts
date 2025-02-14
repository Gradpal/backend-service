import { Module } from '@nestjs/common';
import { PlatformNotifierService } from './platform-notifier.service';
import { JwtModule } from '@nestjs/jwt';
import { PlatformNotifierController } from './platform-notifier.controller';
import { WebSocketGatewayHandler } from '../../websocket/gateway.socket';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [JwtModule, NotificationModule],
  controllers: [PlatformNotifierController],
  providers: [PlatformNotifierService, WebSocketGatewayHandler],
  exports: [PlatformNotifierService],
})
export class PlatformHandlerModule {}
