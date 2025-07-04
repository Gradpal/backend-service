import { ONE_HOUR, ONE_MINUTE } from '@app/common/constants/all.constants';

export const USER_BY_EMAIL_CACHE = {
  name: 'USER_BY_EMAIL_CACHE',
  ttl: 30 * ONE_MINUTE,
};

export const RESET_PASSWORD_CACHE = {
  name: 'RESET_PASSWORD_CACHE',
  ttl: 15 * ONE_MINUTE, // 15 minutes in milliseconds
};
export const MEETING_CACHE = {
  name: 'MEETING_CACHE',
  ttl: 60 * 24 * ONE_MINUTE,
};

export const FAILED_LOGIN_ATTEMPT = {
  name: 'FAILED_LOGIN_ATTEMPT',
  ttl: 5 * ONE_MINUTE,
};

export const USER_INVITATION_CACHE = {
  name: 'USER_INVITATION_CACHE',
  ttl: 2 * 24 * ONE_HOUR, // 2 days
};
