// not found
export const _400 = {
  EMPTY_EXCEL_FILE: {
    code: 'EMPTY_EXCEL_FILE',
    message: 'The excel file is empty',
  },
  PORTFOLIO_NOT_SUBMITTED: {
    code: 'PORTFOLIO_NOT_SUBMITTED',
    message: 'The provided portfolio is not yet submitted',
  },
  INVALID_SEARCH_OPTIONS: {
    code: 'INVALID_SEARCH_OPTIONS',
    message: 'Some search options are missing',
  },
  BAD_FILE_FORMAT: {
    code: 'BAD_REQUEST',
    message: 'You are uploading a file that is not supported ',
  },
  INCOMPLETE_SECTION_EXIST: {
    code: 'INCOMPLETE_SECTION_EXIST',
    message:
      'There are some sections that are not yet complete in this profile ',
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'The OTP you have provided is invalid ',
  },
  INVALID_ADMIN_REG_CODE: {
    code: 'INVALID_ADMIN_REG_CODE',
    message: 'You provided Invalid admin registion code ',
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
  PROJECT_NOT_APPROVED: {
    code: 'PROJECT_NOT_APPROVED',
    message: 'The project with the provided attributes is not yet approved',
  },
  INVALID_PORTFOLIO_FIELD: {
    code: 'INVALID_PORTFOLIO_FIELD',
    message:
      'The provided portfolio field to remove the item from is not valid',
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
  COMPANY_NOT_FOUND: {
    code: 'COMPANY_NOT_FOUND',
    message: 'No Company exists with provided attributes',
  },
  DATABASE_RECORD_NOT_FOUND: {
    code: 'DATABASE_RECORD_NOT_FOUND',
    message: 'Record does not exist in the database',
  },
  PORTFOLIO_NOT_FOUND: {
    code: 'PORTFOLIO_NOT_FOUND',
    message: 'No portfolio exists with provided attributes',
  },
  NO_PORTFOLIO_OWNED: {
    code: 'PORTFOLIO_NOT_FOUND',
    message: 'The loggedIn profile does not own any portfolio',
  },
  ACADEMIC_MODULE_NOT_FOUND: {
    code: 'ACADEMIC_MODULE_NOT_FOUND',
    message: 'No Acadmic Module exisits with provided attributes',
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
  PROJECT_NOT_FOUND: {
    code: 'PROJECT_NOT_FOUND',
    message: 'Project does not exist in the database',
  },
  PROJECT_COLLABORATOR_NOT_FOUND: {
    code: 'PROJECT_COLLABORATOR_NOT_FOUND',
    message: 'Project collaborator does not exist in the database',
  },
  EDITOR_DOCUMENT_NOT_FOUND: {
    code: 'EDITOR_DOCUMENT_NOT_FOUND',
    message: 'Editor document does not exist in the database',
  },
  ACADEMIC_PROJECT_NOT_FOUND: {
    code: 'ACADEMIC_PROJECT_NOT_FOUND',
    message: 'Project does not exist in the database',
  },
  SUPERVISION_MEETING_NOT_FOUND: {
    code: 'SUPERVISION_MEETING_NOT_FOUND',
    message: 'Supervision meeting does not exist in the database',
  },
  PROGRAM_NOTFOUND: {
    code: 'PROGRAM_NOTFOUND',
    message: 'The program with the provided ID is not found',
  },
  PANEL_ASSIGNMENT_NOTFOUND: {
    code: 'PANEL_ASSIGNMENT_NOTFOUND',
    message: 'Panel assign does not exist in the database',
  },
  PRE_DEFENSE_MEETING_NOT_FOUND: {
    code: 'PRE_DEFENSE_MEETING_NOT_FOUND',
    message: 'predefense meeting does not exisit in the database',
  },
  DEFENSE_PANEL_NOT_FOUND: {
    code: 'DEFENSE_PANEL_NOT_FOUND',
    message: 'defense panel does not exist in the database',
  },
  PROJECT_SUBMISSION_NOT_FOUND: {
    code: 'PROJECT_SUBMISSION_NOT_FOUND',
    message: 'project sumission does not exist in the database',
  },
  AWARD_NOT_FOUND: {
    code: 'AWARD_NOT_FOUND',
    message: 'Award does not exist in the database',
  },
  EXTRA_CURRICULAR_ACTIVITY_NOT_FOUND: {
    code: 'EXTRA_CURRICULAR_ACTIVITY_NOT_FOUND',
    message: 'Extracurricular activity does not exist in the database',
  },
  PROFESSIONAL_EXPERIENCE_NOT_FOUND: {
    code: 'PROFESSIONAL_EXPERIENCE_NOT_FOUND',
    messagee: 'The professinal exprience does not exist in the database',
  },
  TOPIC_SUBMISSION_NOT_FOUND: {
    code: 'TOPIC_SUBMISSION_NOT_FOUND',
    message: 'Topic sumission does not exist in the database',
  },
};

// conflict
export const _409 = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User already exists',
  },
  POSITION_ALREADY_EXISTS: {
    code: 'POSITION_ALREADY_EXISTS',
    message: 'The provided position already exists in the portfolio',
  },
  RECOMMENDATION_ALREADY_EXISTS: {
    code: 'RECOMMENDATION_ALREADY_EXISTS',
    message: 'You have already recommeded this student',
  },
  DATABASE_RECORD_ALREADY_EXISTS: {
    code: 'DATABASE_RECORD_ALREADY_EXISTS',
    message: 'Record already exists in the database',
  },
  FOREIGN_KEY_VIOLATION: {
    code: 'FOREIGN_KEY_VIOLATION',
    message: 'Referenced record does not exist',
  },
  PROJECT_COLLABORATOR_ALREADY_EXISTS: {
    code: 'PROJECT_COLLABORATOR_ALREADY_EXISTS',
    message: 'project collaborator already exist',
  },
  PROJECT_WITH_PENDING_REVIEWER_COMMENTS: {
    code: 'PROJECT_WITH_PENDING_REVIEWER_COMMENTS',
    message: 'project has pending reviewer comment',
  },
  INNOVATION_PROJECT_REQUIRES_INCUBATION_STAFF_REVIEWER: {
    code: 'INNOVATION_PROJECT_REQUIRES_INCUBATION_STAFF_REVIEWER',
    message: 'innovation project requires incubation staff supervisor/reviwer',
  },
  RESEARCH_PROJECT_REQUIRES_LECTURE_REVIEWER: {
    code: 'RESEARCH_PROJECT_REQUIRES_LECTURE_REVIEWER',
    message: 'research project requires lecture supervisor/reviwer',
  },
  HOD_ASSIGNS_SUPERVISOR_TO_ACADEMIC_PROJECT: {
    code: 'HoD_ASSIGNS_SUPERVISOR_TO_ACADEMIC_PROJECT',
    message: 'HoD assigns supervisor/reviwer to academic project',
  },
  AT_LEAST_ONE_SUPERVISION_MEETING_IS_REQUIRED: {
    code: 'AT_LEAST_ONE_SUPERVISION_MEETING_IS_REQUIRED',
    message:
      'At least one supervision meeting is required to submit project for review',
  },
  STUDENT_ALREADY_HAS_ACADEMIC_PROJECT: {
    code: 'STUDENT_ALREADY_HAS_ACADEMIC_PROJECT',
    message: 'Student alreadt has academic project',
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
