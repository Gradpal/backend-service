import { Status } from '@grpc/grpc-js/build/src/constants';

export const GRPC_ERRORS = {
  INVALID_ARGUMENT: {
    code: Status.INVALID_ARGUMENT,
    message: 'Invalid argument/parameter provided',
  },
  NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'Resource not found',
  },
  STUDENT_NOT_FOUND: {
    code: Status.NOT_FOUND,
    message: 'No Student exists with provided attributes',
  },
  ALREADY_EXISTS: {
    code: Status.ALREADY_EXISTS,
    message: 'Resource already exists',
  },
  PERMISSION_DENIED: {
    code: Status.PERMISSION_DENIED,
    message: 'Permission denied',
  },
  UNAUTHENTICATED: {
    code: Status.UNAUTHENTICATED,
    message: 'Unauthenticated request',
  },
  INTERNAL: {
    code: Status.INTERNAL,
    message: 'Internal server error',
  },
  UNAVAILABLE: {
    code: Status.UNAVAILABLE,
    message: 'Service unavailable',
  },
};

export type GrpcErrorType = (typeof GRPC_ERRORS)[keyof typeof GRPC_ERRORS];
