import { ActivateAccountDto } from '@core-service/integrations/notification/dto/emails/activate-account.dto';
import {
  ParentInvitationEmailDto,
  WelcomeEmailDto,
} from '@core-service/integrations/notification/dto/emails/welcome.email.dto';

export enum EmailTemplates {
  WELCOME = 'welcome',
  VERIFICATION = 'verify-email',
  ACTIVATION = 'activate-account',
  USER_ONBOARDING_VERIFICATION = 'user-onboarding-verification',
  PARENT_INVITATION = 'invite-parent',
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
  [EmailTemplates.USER_ONBOARDING_VERIFICATION]: {
    subject: 'Verify Your Email',
    dto: WelcomeEmailDto,
  },
  [EmailTemplates.PARENT_INVITATION]: {
    subject: 'Your Child has invited you to join Gradpal',
    dto: ParentInvitationEmailDto,
  },
} as const;

export type EmailTemplateDataMap = {
  [K in EmailTemplates]: InstanceType<
    (typeof EMAIL_TEMPLATES_CONFIG)[K]['dto']
  >;
};
