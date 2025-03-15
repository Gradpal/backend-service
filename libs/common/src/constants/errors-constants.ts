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
  USER_WITH_REFERAL_CODE_NOT_FOUND: {
    code: 'USER_WITH_REFERAL_CODE_NOT_FOUND',
    message: 'No User exists with provided referal code',
  },
  DATABASE_RECORD_NOT_FOUND: {
    code: 'DATABASE_RECORD_NOT_FOUND',
    message: 'Record does not exist in the database',
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
};

// conflict
export const _409 = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User already exists',
  },
  DATABASE_RECORD_ALREADY_EXISTS: {
    code: 'DATABASE_RECORD_ALREADY_EXISTS',
    message: 'Record already exists in the database',
  },
  FOREIGN_KEY_VIOLATION: {
    code: 'FOREIGN_KEY_VIOLATION',
    message: 'Referenced record does not exist',
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
