import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PATTERNS,
  QUEUE_HANDLERS,
} from '@app/common/constants/rabbitmq-constants';
import { EmailQueuePayload } from '@app/common/interfaces/shared-queues/email-payload.interface';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(QUEUE_HANDLERS.EMAIL) private emailClient: ClientProxy,
    @Inject(QUEUE_HANDLERS.PLATFORM) private platformClient: ClientProxy,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  /**
   * Sends a platform notification via the platform queue.
   * @param userId - The user ID to send the notification to.
   * @param notification - The notification details.
   * @returns An Observable that the caller can subscribe to for handling responses or errors.
   */
  async sendPlatformNotification(payload: PlatformQueuePayload) {
    try {
      return this.platformClient.emit(PATTERNS.SEND_PLATFORM, payload);
    } catch (error) {
      Logger.error('Error sending platform notification:', error);
      this.exceptionHandler.throwInternalServerError(error);
    }
  }

  /**
   * Sends an email notification via the email queue.
   * @param payload - The email details, including recipient, subject, HTML content, and additional data.
   * @returns An Observable that the caller can subscribe to for handling responses or errors.
   */
  async sendEmailNotification(payload: EmailQueuePayload) {
    try {
      return this.emailClient.emit(PATTERNS.SEND_EMAIL, payload);
    } catch (error) {
      Logger.error('Error sending email:', error);
      this.exceptionHandler.throwInternalServerError(error);
    }
  }
}
