import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EmailNotifierService } from './email-notifier.service';
import { PATTERNS } from '@app/common/constants/rabbitmq-constants';
import { EmailQueuePayload } from '@app/common/interfaces/shared-queues/email-payload.interface';
import { BaseQueueHandler } from '@app/common/rabbitmq/base-queue.handler';

@Controller()
export class EmailNotifierController extends BaseQueueHandler<
  EmailQueuePayload,
  void
> {
  constructor(private readonly emailService: EmailNotifierService) {
    super('EmailHandler', emailService);
  }

  @EventPattern(PATTERNS.SEND_EMAIL)
  async handleEmail(
    @Payload() data: EmailQueuePayload,
    @Ctx() context: RmqContext,
  ) {
    return this.handleMessage(data, context);
  }

  protected async processMessage(data: EmailQueuePayload): Promise<void> {
    const emailPromises = data.emailRecipients.map((email) =>
      this.emailService.sendEmail(email, data.subject, data.htmlTemplate),
    );
    await Promise.all(emailPromises);
  }
}
