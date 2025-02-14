import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

@Injectable()
export class EmailNotifierService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, message: `Email sent to ${to}` };
    } catch (error) {
      Logger.error('Failed to send email:', error);
      throw this.exceptionHandler.throwInternalServerError(error);
    }
  }
}
