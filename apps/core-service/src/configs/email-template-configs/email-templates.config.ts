import { ActivateAccountDto } from '@core-service/integrations/notification/dto/emails/activate-account.dto';
import {
  AcceptRejectBidStudentDto,
  AutonomousServiceCreationEmailDto,
  BidAcceptedRejectedDto,
  BidReceivedDto,
  BidSubmittedTeacherDto,
  CounterBidSubmitted,
  InvitationCreationEmailDto,
  ReviewDto,
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
  BID_RECEIVED = 'bid_received',
  BID_SUBMITTED = 'bid_submitted',
  COUNTER_BID_SUBMITTED = 'counter_bid_submitted',
  ACCEPT_BID_STUDENT = 'accept_bid_student',
  REJECT_BID_STUDENT = 'reject_bid_student',
  REVIEW = 'review',
  BID_ACCEPTED = 'bid_accepted',
  BID_REJECTED = 'bid_rejected',
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
    subject: '✅ Your Autonomous Service Request Has Been Posted',
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
  [EmailTemplates.BID_RECEIVED]: {
    subject: ' New Bid Received on Your Service Request',
    dto: BidReceivedDto,
  },
  [EmailTemplates.BID_SUBMITTED]: {
    subject: 'Your Bid Has Been Submitted\n',
    dto: BidSubmittedTeacherDto,
  },
  [EmailTemplates.COUNTER_BID_SUBMITTED]: {
    subject: 'New Counterbid Received\n',
    dto: CounterBidSubmitted,
  },
  [EmailTemplates.ACCEPT_BID_STUDENT]: {
    subject: 'You’ve Responded to a Bid',
    dto: AcceptRejectBidStudentDto,
  },
  [EmailTemplates.REJECT_BID_STUDENT]: {
    subject: "You've Responded to a Bid",
    dto: AcceptRejectBidStudentDto,
  },
  [EmailTemplates.REVIEW]: {
    subject: 'Service Marked as Complete\n',
    dto: ReviewDto,
  },
  [EmailTemplates.BID_ACCEPTED]: {
    subject: 'Update on Your Bid for',
    dto: BidAcceptedRejectedDto,
  },
  [EmailTemplates.BID_REJECTED]: {
    subject: 'Update on Your Bid for',
    dto: BidAcceptedRejectedDto,
  },
} as const;

export type EmailTemplateDataMap = {
  [K in EmailTemplates]: InstanceType<
    (typeof EMAIL_TEMPLATES_CONFIG)[K]['dto']
  >;
};
