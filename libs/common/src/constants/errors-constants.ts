// not found
export const _400 = {
  EMPTY_EXCEL_FILE: {
    code: 'EMPTY_EXCEL_FILE',
    message: 'The excel file is empty',
  },
  INVALID_SEARCH_OPTIONS: {
    code: 'INVALID_SEARCH_OPTIONS',
    message: 'Some search options are missing',
  },
  BAD_FILE_FORMAT: {
    code: 'BAD_REQUEST',
    message: 'You are uploading a file that is not supported ',
  },
  PORTFOLIO_NOT_OWNER: {
    code: 'PORTFOLIO_NOT_OWNER',
    message: 'The portfolio is not owned by the logged in user',
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'The OTP you have provided is invalid ',
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: 'The file is too large',
  },
  INVALID_DATA_FOR_TEMPLATE: {
    code: 'INVALID_DATA_FOR_TEMPLATE',
    message: 'The provided data for the template is invalid',
  },
  INVALID_USER_ID: {
    code: 'INVALID_USER_ID',
    message: 'The provided user id is invalid',
  },
  INVALID_USER_ROLE: {
    code: 'INVALID_USER_ROLE',
    message: 'The provided user role is invalid',
  },
  INSUFFICIENT_CREDITS: {
    code: 'INSUFFICIENT_CREDITS',
    message: 'You do not have enough credits for this session',
  },
  TIME_SLOT_NOT_AVAILABLE: {
    code: 'TIME_SLOT_NOT_AVAILABLE',
    message: 'The selected time slot is not available',
  },
  USER_ALREADY_DEACTIVATED: {
    code: 'USER_ALREADY_DEACTIVATED',
    message: 'The user is already deactivated',
  },
  USER_ALREADY_ACTIVATED: {
    code: 'USER_ALREADY_ACTIVATED',
    message: 'The user is already activated',
  },
  STRIPE_ACCOUNT_CREATION_FAILED: {
    code: 'STRIPE_ACCOUNT_CREATION_FAILED',
    message: 'Failed to create Stripe account',
  },
  SESSION_CANCELLED: {
    code: 'SESSION_CANCELLED',
    message: 'The session has been cancelled',
  },
  SESSION_NOT_IN_PROGRESS: {
    code: 'SESSION_NOT_IN_PROGRESS',
    message: 'The session is not in progress',
  },
  SESSION_NOT_SCHEDULED: {
    code: 'SESSION_NOT_SCHEDULED',
    message: 'The session is not scheduled',
  },
  POSTPONED_SESSION: {
    code: 'POSTPONED_SESSION',
    message: 'The session has been postponed',
  },
  SESSION_NOT_JOINED: {
    code: 'SESSION_NOT_JOINED',
    message: 'The session has not been joined',
  },
  SESSION_COMPLETED: {
    code: 'SESSION_COMPLETED',
    message: 'The session has been completed',
  },
  SESSION_IN_PROGRESS: {
    code: 'SESSION_IN_PROGRESS',
    message: 'The session is in progress',
  },
  STRIPE_ACCOUNT_RETRIEVAL_FAILED: {
    code: 'STRIPE_ACCOUNT_RETRIEVAL_FAILED',
    message: 'Failed to retrieve Stripe account',
  },
  PACKAGE_TYPE_ALREADY_EXISTS: {
    code: 'PACKAGE_TYPE_ALREADY_EXISTS',
    message: 'A package type with the same maximum sessions already exists',
  },

  //complaints
  COMPLAINT_NOT_PENDING: {
    code: 'COMPLAINT_NOT_PENDING',
    message: 'The complaint is not in pending status',
  },
};

// unauthorized
export const _401 = {
  ACCOUNT_NOT_VERIFIED: {
    code: 'ACCOUNT_NOT_VERIFIED',
    message: 'The account is not yet verified',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials provided',
  },
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    message: 'Invalid JWT Token',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'JWT Token Expired',
  },
  MALFORMED_TOKEN: {
    code: 'MALFORMED_TOKEN',
    message: 'The provided token is malformed.',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'The provided token was expired.',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'This account has been temporarily locked',
  },
};

// forbidden
export const _403 = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action',
  },
  UNAUTHORIZED_TO_UPDATE_BOOKING: {
    code: 'UNAUTHORIZED_TO_UPDATE_BOOKING',
    message: 'Only the tutor can update the booking status',
  },
  SESSION_NOT_YOURS: {
    code: 'SESSION_NOT_YOURS',
    message: 'You are not allowed to perform this action on this session',
  },
  NOT_AUTHORIZED_TO_JOIN_SESSION: {
    code: 'NOT_AUTHORIZED_TO_JOIN_SESSION',
    message: 'You are not authorized to join this session',
  },
  UNAUTHORIZED_TO_UPDATE_PORTFOLIO: {
    code: 'UNAUTHORIZED_TO_UPDATE_PORTFOLIO',
    message:
      'You are not allowed to update this portfolio because it is not yours',
  },
  SUBJECT_TIER_NOT_BELONG_TO_PORTFOLIO: {
    code: 'SUBJECT_TIER_NOT_BELONG_TO_PORTFOLIO',
    message: 'The subject tier does not belong to the portfolio',
  },
  PARENT_INVITATION_EXPIRED: {
    code: 'PARENT_INVITATION_EXPIRED',
    message: 'The parent invitation has expired',
  },
};

// not found
export const _404 = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'No User exists with provided id',
  },
  STUDENT_NOT_FOUND: {
    code: 'STUDENT_NOT_FOUND',
    message: 'No Student exists with provided attributes',
  },

  PORTFOLIO_NOT_FOUND: {
    code: 'PORTFOLIO_NOT_FOUND',
    message: 'No Portfolio exists with provided atttributes',
  },
  TUTOR_NOT_FOUND: {
    code: 'TUTOR_NOT_FOUND',
    message: 'No Tutor exists with provided attributes',
  },
  USER_WITH_REFERAL_CODE_NOT_FOUND: {
    code: 'USER_WITH_REFERAL_CODE_NOT_FOUND',
    message: 'No User exists with provided referal code',
  },
  DATABASE_RECORD_NOT_FOUND: {
    code: 'DATABASE_RECORD_NOT_FOUND',
    message: 'Record does not exist in the database',
  },

  LOGGED_IN_USER_DOES_NOT_OWN_PORTFOLIO: {
    code: 'LOGGED_IN_USER_DOES_NOT_OWN_PORTFOLIO',
    message: 'The logged in user does not own the portfolio',
  },
  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message:
      'This means that the file, you are trying to access does not exist',
  },
  NOTIFICATION_REGISTRY_NOT_FOUND: {
    code: 'NOTIFICATION_REGISTRY_NOT_FOUND',
    message: 'Notification Registry not found',
  },
  BOOKING_NOT_FOUND: {
    code: 'BOOKING_NOT_FOUND',
    message: 'The requested booking was not found',
  },
  SUBJECT_NOT_FOUND: {
    code: 'SUBJECT_NOT_FOUND',
    message: 'The requested subject was not found',
  },
  SUBJECT_TIER_NOT_FOUND: {
    code: 'SUBJECT_TIER_NOT_FOUND',
    message: 'The requested subject tier was not found',
  },
  SUBJECT_CATEGORY_NOT_FOUND: {
    code: 'SUBJECT_CATEGORY_NOT_FOUND',
    message: 'The requested subject category was not found',
  },
  DAY_SCHEDULE_NOT_FOUND: {
    code: 'DAY_SCHEDULE_NOT_FOUND',
    message: 'The requested day schedule was not found',
  },
  CLASS_SESSION_NOT_FOUND: {
    code: 'CLASS_SESSION_NOT_FOUND',
    message: 'The requested class session was not found',
  },
  PACKAGE_TYPE_NOT_FOUND: {
    code: 'PACKAGE_TYPE_NOT_FOUND',
    message: 'The requested package type was not found',
  },
  PRICING_MODEL_NOT_FOUND: {
    code: 'PRICING_MODEL_NOT_FOUND',
    message: 'The requested pricing model was not found',
  },
  PRICING_RULE_NOT_FOUND: {
    code: 'PRICING_RULE_NOT_FOUND',
    message: 'The requested pricing rule was not found',
  },
  NATIONAL_PORTAL_NOT_FOUND: {
    code: 'NATIONAL_PORTAL_NOT_FOUND',
    message: 'The requested national portal was not found',
  },

  //complaints
  COMPLAINT_NOT_FOUND: {
    code: 'COMPLAINT_NOT_FOUND',
    message: 'The requested complaint was not found',
  },

  // legal documents
  LEGAL_DOCUMENT_NOT_FOUND: {
    code: 'LEGAL_DOCUMENT_NOT_FOUND',
    message: 'The requested legal document was not found',
  },
};

// conflict
export const _409 = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User already exists',
  },
  PROFILE_ALREADY_EXISTS: {
    code: 'PROFILE_ALREADY_EXISTS',
    message: 'The provided user already has a profile set',
  },
  DATABASE_RECORD_ALREADY_EXISTS: {
    code: 'DATABASE_RECORD_ALREADY_EXISTS',
    message: 'Record already exists in the database',
  },
  FOREIGN_KEY_VIOLATION: {
    code: 'FOREIGN_KEY_VIOLATION',
    message: 'Referenced record does not exist',
  },
  PRICING_MODEL_ALREADY_EXISTS: {
    code: 'PRICING_MODEL_ALREADY_EXISTS',
    message: 'Pricing model already exists',
  },
  PRICING_RULE_ALREADY_EXISTS: {
    code: 'PRICING_RULE_ALREADY_EXISTS',
    message: 'Pricing rule already exists',
  },
  PHONE_NUMBER_ALREADY_EXISTS: {
    code: 'PHONE_NUMBER_ALREADY_EXISTS',
    message: 'Phone number already exists',
  },
  COMPLAINT_ALREADY_EXISTS: {
    code: 'COMPLAINT_ALREADY_EXISTS',
    message:
      'A complaint with the same description, session, issue type and priority already exists',
  },
  NATIONAL_PORTAL_ALREADY_EXISTS: {
    code: 'NATIONAL_PORTAL_ALREADY_EXISTS',
    message: 'National portal already exists',
  },
  SUBJECT_ALREADY_EXISTS: {
    code: 'SUBJECT_ALREADY_EXISTS',
    message: 'Subject already exists',
  },
  SUBJECT_CATEGORY_ALREADY_EXISTS: {
    code: 'SUBJECT_CATEGORY_ALREADY_EXISTS',
    message: 'Subject category already exists',
  },
  UNIVERSITY_ALREADY_EXISTS: {
    code: 'UNIVERSITY_ALREADY_EXISTS',
    message: 'University already exists',
  },
};

// internal server error
export const _500 = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'The service is temporarily not available',
  },
};

// service unavailable
export const _503 = {
  EXTERNAL_SERVICE_UNAVAILABLE: {
    code: 'EXTERNAL_SERVICE_UNAVAILABLE',
    message: 'External service is temporarily unavailable',
  },
};

type ValueOf<T> = T[keyof T];

export type TypeOfError =
  | ValueOf<typeof _400>
  | ValueOf<typeof _401>
  | ValueOf<typeof _403>
  | ValueOf<typeof _404>
  | ValueOf<typeof _409>
  | ValueOf<typeof _500>
  | ValueOf<typeof _503>;
