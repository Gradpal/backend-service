import { Injectable, Logger } from '@nestjs/common';
import {
  EMAIL_TEMPLATES_CONFIG,
  EmailTemplateDataMap,
  EmailTemplates,
} from '@core-service/configs/email-template-configs/email-templates.config';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400 } from '@app/common/constants/errors-constants';
import { NotificationService } from './notification.service';
import { compileTemplate } from '@core-service/configs/email-template-configs/email-templates-compiler.config';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { Repository } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationPreProcessor {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  /**
   * Sends a templated email to the specified recipients.
   *
   * @param template - The email template to use.
   * @param recipients - The list of email recipients.
   * @param data - The data to populate the email template.
   * @throws BadRequestException - If the provided data is invalid for the specified template.
   */
  async sendTemplateEmail<T extends EmailTemplates>(
    template: T,
    recipients: string[],
    data?: EmailTemplateDataMap[T],
  ): Promise<void> {
    const config = EMAIL_TEMPLATES_CONFIG[template];

    if (config.dto && data) {
      // Validate using class-validator
      const dtoClass = config.dto as ClassConstructor<typeof data>;
      const dto = plainToInstance(dtoClass, data);
      const errors = await validate(dto);

      if (errors.length > 0) {
        Logger.error(
          `Invalid data for template ${template}: ${JSON.stringify(errors)}`,
        );
        this.exceptionHandler.throwBadRequest(_400.INVALID_DATA_FOR_TEMPLATE);
      }
    }

    const htmlContent = compileTemplate(template, data);
    await this.notificationService.sendEmailNotification({
      emailRecipients: recipients,
      subject: config.subject,
      htmlTemplate: htmlContent,
    });
  }

  /**
   * Sends a platform notification to the specified user.
   *
   * @param payload - The notification payload.
   * @throws BadRequestException - If a user ID is invalid.
   */
  async sendPlatformNotification(payload: PlatformQueuePayload): Promise<void> {
    for (const recipient of payload.recipients) {
      const user = await this.userRepository.findOne({
        where: { id: recipient.userId },
      });
      if (!user) {
        this.exceptionHandler.throwBadRequest(_400.INVALID_USER_ID);
      }
    }

    await this.notificationService.sendPlatformNotification(payload);
  }
}
