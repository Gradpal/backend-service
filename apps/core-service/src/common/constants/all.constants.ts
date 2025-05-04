export const APP_NAME = 'CORE-SERVICE';
export const APP_BASE_PATH = 'api/v1';
export const SWAGGER_DOCUMENTATION_PATH = '/api/documentation';
export const JWT_APP_ISSUER = 'GRADPAL';
export const ROLE_GUARD_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const LOGGED_IN_USER_KEY = 'AuthUser';
export const REDIS_CONST = {
  APP_PREFIX: 'gradpal-core-service',
};
export const MAX_FAILED_ATTEMPTS = 5;
export const REFERRAL_CODE_CREDISTS = 2;
export const DESCRIPTION_MAX_LENGTH = 300;
export const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const ATTACHMENT_MAX_COUNT = 5;
export const ATTACHMENT_SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
