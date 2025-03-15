import { MailerOptions } from '@nestjs-modules/mailer';
import { NotificationConfigService } from './notification-config.service';

export const createMailerConfig = (
  configService: NotificationConfigService,
): MailerOptions => ({
  transport: {
    host: 'live.smtp.mailtrap.io',
    port: 587,
    secure: false,
    auth: {
      user: configService.smtpUser,
      pass: configService.smtpPassword,
    },
  },
  defaults: {
    from: `"Gradpal" <${configService.smtpEmail}>`,
  },
});
