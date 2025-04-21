import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { SlackService } from '../slack/slack.service';
import { NotificationConfigService } from '@notification-service/configs/notification-config.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailNotifierService {
  private readonly logger = new Logger(EmailNotifierService.name);

  constructor(
    private readonly exceptionHandler: ExceptionHandler,
    private readonly slackService: SlackService,
    private readonly notificationConfigService: NotificationConfigService,
    private readonly mailerService: MailerService,
  ) {}

  private formatEmailPreview(htmlContent: string): string {
    // First, extract important links and OTPs
    const links =
      htmlContent.match(/href="([^"]+)"/g)?.map((href) => {
        const url = href.replace('href="', '').replace('"', '');
        // Decode HTML entities in URLs
        return url
          .replace(/&#x3D;/g, '=')
          .replace(/&#61;/g, '=')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&nbsp;/g, ' ');
      }) || [];
    const otps = htmlContent.match(/\b\d{6}\b/g) || []; // Match 6-digit OTPs
    const verificationLinks =
      htmlContent.match(/https:\/\/[^\s<>"]+/g)?.map((url) =>
        url
          .replace(/&#x3D;/g, '=')
          .replace(/&#61;/g, '=')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&nbsp;/g, ' '),
      ) || []; // Match URLs

    // Remove HTML tags but preserve text content
    const cleanContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style tags
      .replace(/<header>[\s\S]*?<\/header>/g, '') // Remove header
      .replace(/<footer>[\s\S]*?<\/footer>/g, '') // Remove footer
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x3D;/g, '=')
      .replace(/&#61;/g, '=')
      .replace(/&#039;/g, "'")
      .replace(/style="[^"]*"/g, '') // Remove style attributes
      .replace(/class="[^"]*"/g, '') // Remove class attributes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Split into paragraphs and clean up
    const paragraphs = cleanContent
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Add important information at the end
    const importantInfo = [];
    if (otps.length > 0) {
      importantInfo.push('OTP(s): ' + otps.join(', '));
    }
    if (links.length > 0) {
      importantInfo.push('Links: ' + links.join(', '));
    }
    if (verificationLinks.length > 0) {
      importantInfo.push('Verification Links: ' + verificationLinks.join(', '));
    }

    return [
      ...paragraphs,
      ...(importantInfo.length > 0
        ? ['', 'Important Information:', ...importantInfo]
        : []),
    ].join('\n\n');
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      // Create a readable preview for Slack
      const preview = this.formatEmailPreview(htmlContent);
      const slackMessage = [
        `📧 *New Email Notification*`,
        '',
        `*To:* ${to}`,
        `*Subject:* ${subject}`,
        '',
        `*Preview:*`,
        preview,
      ].join('\n');

      const [slack] = await Promise.allSettled([
        // this.mailerService.sendMail({
        //   to,
        //   subject,
        //   html: htmlContent, // Use the HTML content directly since it's already a complete template
        // }),
        // this.resend.emails.send({
        //   from: 'ijabo@gmail.com',
        //   to: to,
        //   subject,
        //   html: htmlContent,
        // }),
        this.slackService.sendMessage(slackMessage),
      ]);

      console.log('========>', slack);

      if (slack.status === 'rejected') {
        throw new Error('Failed to send email');
      }

      return { success: true, message: `Email sent to ${to}` };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw this.exceptionHandler.throwInternalServerError(error);
    }
  }
}
