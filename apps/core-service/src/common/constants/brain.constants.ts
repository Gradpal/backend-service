import { ONE_MINUTE } from '@app/common/constants/all.constants';

export const USER_BY_ID_CACHE = {
  name: 'USER_BY_ID_CACHE',
  ttl: 30 * ONE_MINUTE,
};

export const RESET_PASSWORD_CACHE = {
  name: 'RESET_PASSWORD_CACHE',
  ttl: 15 * ONE_MINUTE, // 15 minutes in milliseconds
};

export const FAILED_LOGIN_ATTEMPT = {
  name: 'FAILED_LOGIN_ATTEMPT',
  ttl: 5 * ONE_MINUTE,
};
