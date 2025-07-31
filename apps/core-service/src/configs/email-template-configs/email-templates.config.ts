import { ActivateAccountDto } from '@core-service/integrations/notification/dto/emails/activate-account.dto';
import {
  AutonomousServiceCreationEmailDto,
  InvitationCreationEmailDto,
} from '@core-service/integrations/notification/dto/emails/autonomous_service.email.dto';
import {
  AddEmailEmailDto,
  ParentInvitationEmailDto,
  WelcomeEmailDto,
} from '@core-service/integrations/notification/dto/emails/welcome.email.dto';

export enum EmailTemplates {
  WELCOME = 'welcome',
  VERIFICATION = 'verify-email',
  VERIFICATION_ADDITIONAL_EMAIL = 'add-email',
  ACTIVATION = 'activate-account',
  USER_ONBOARDING_VERIFICATION = 'user-onboarding-verification',
  PARENT_INVITATION = 'invite-parent',
  AUTONOMOUS_SERVICE_CREATION = 'autonomous_service_creation',
  INVITATION_CREATION = 'invitation_creation',
  INVITATION_SENT = 'invitation_sent',
  INVITATION_DELETED = 'invitation_deleted',
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
  [EmailTemplates.VERIFICATION_ADDITIONAL_EMAIL]: {
    subject: 'Verify Your Additional Email',
    dto: AddEmailEmailDto,
  },
  [EmailTemplates.USER_ONBOARDING_VERIFICATION]: {
    subject: 'Verify Your Email',
    dto: WelcomeEmailDto,
  },
  [EmailTemplates.PARENT_INVITATION]: {
    subject: 'Your Child has invited you to join Gradpal',
    dto: ParentInvitationEmailDto,
  },
  [EmailTemplates.AUTONOMOUS_SERVICE_CREATION]: {
    subject: 'Service invitation creation ',
    dto: AutonomousServiceCreationEmailDto,
  },
  [EmailTemplates.INVITATION_CREATION]: {
    subject: 'autonomous service invitation created ',
    dto: InvitationCreationEmailDto,
  },
  [EmailTemplates.INVITATION_SENT]: {
    subject: 'autonomous service invitation sent ',
    dto: InvitationCreationEmailDto,
  },
  [EmailTemplates.INVITATION_DELETED]: {
    subject: 'autonomous service invitation deleted ',
    dto: InvitationCreationEmailDto,
  },
} as const;

export type EmailTemplateDataMap = {
  [K in EmailTemplates]: InstanceType<
    (typeof EMAIL_TEMPLATES_CONFIG)[K]['dto']
  >;
};
