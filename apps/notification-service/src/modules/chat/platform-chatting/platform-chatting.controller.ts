import { PATTERNS } from '@app/common/constants/rabbitmq-constants';
import { MessageQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { BaseQueueHandler } from '@app/common/rabbitmq/base-queue.handler';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PlatformChattingService } from './platform-chatting.service';

@Controller('platform-chatting')
export class PlatformChattingController extends BaseQueueHandler<
  MessageQueuePayload,
  void
> {
  constructor(private readonly platformService: PlatformChattingService) {
    super('PlatformChatting', platformService);
  }

  @EventPattern(PATTERNS.SEND_MESSAGE)
  async handleMessageNotification(
    @Payload() data: MessageQueuePayload,
    @Ctx() context: RmqContext,
  ) {
    return this.handleMessage(data, context);
  }

  protected async processMessage(message: MessageQueuePayload): Promise<void> {
    await this.platformService.broadcastToUsers(message);
  }
}
