import { ActivateAccountDto } from '@core-service/integrations/notification/dto/emails/activate-account.dto';
import { VerificationEmailDto } from '@core-service/integrations/notification/dto/emails/verification.email.dto';
import { WelcomeEmailDto } from '@core-service/integrations/notification/dto/emails/welcome.email.dto';

export enum EmailTemplates {
  WELCOME = 'welcome',
  VERIFICATION = 'verify-email',
  ACTIVATION = 'activate-account',
}

export const EMAIL_TEMPLATES_CONFIG = {
  [EmailTemplates.WELCOME]: {
    subject: 'Welcome to Gradpal!',
    dto: WelcomeEmailDto,
  },
  [EmailTemplates.ACTIVATION]: {
    subject: 'Activate your account!',
    dto: ActivateAccountDto,
  },
  [EmailTemplates.VERIFICATION]: {
    subject: 'Verify Your Email',
    dto: WelcomeEmailDto,
  },
} as const;

export type EmailTemplateDataMap = {
  [K in EmailTemplates]: InstanceType<
    (typeof EMAIL_TEMPLATES_CONFIG)[K]['dto']
  >;
};
