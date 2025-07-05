import { Controller } from '@nestjs/common';
import { PlatformNotifierService } from './platform-notifier.service';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { BaseQueueHandler } from '@app/common/rabbitmq/base-queue.handler';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PATTERNS } from '@app/common/constants/rabbitmq-constants';

@Controller()
export class PlatformNotifierController extends BaseQueueHandler<
  PlatformQueuePayload,
  void
> {
  constructor(private readonly platformService: PlatformNotifierService) {
    super('PlatformNotifications', platformService);
  }

  @EventPattern(PATTERNS.SEND_PLATFORM)
  async handlePlatformNotification(
    @Payload() data: PlatformQueuePayload,
    @Ctx() context: RmqContext,
  ) {
    return this.handleMessage(data, context);
  }

  protected async processMessage(
    notification: PlatformQueuePayload,
  ): Promise<void> {
    await this.platformService.broadcastToUsers(notification);
  }
}
