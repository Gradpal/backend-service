export const NOTIFICATION_QUEUE_NAMES = {
  EMAIL: 'email_queue',
  PLATFORM: 'platform_queue',
  SMS: 'sms_queue',
} as const;

export const PATTERNS = {
  SEND_EMAIL: 'send_email',
  SEND_PLATFORM: 'send_platform',
  SEND_SMS: 'send_sms',
} as const;

export const QUEUE_HANDLERS = {
  EMAIL: 'EMAIL_SERVICE',
  PLATFORM: 'PLATFORM_SERVICE',
  SMS: 'SMS_SERVICE',
} as const;
