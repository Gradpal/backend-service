import { MailerOptions } from '@nestjs-modules/mailer';
import { NotificationConfigService } from './notification-config.service';

export const createMailerConfig = (
  configService: NotificationConfigService,
): MailerOptions => ({
  transport: {
    host: 'mail.rp.ac.rw',
    port: 587,
    secure: false,
    auth: {
      user: configService.smtpEmail,
      pass: configService.smtpPassword,
    },
  },
  defaults: {
    from: `"E-portfolio" <${configService.smtpEmail}>`,
  },
});
