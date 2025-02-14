import { _401 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

//  The exceptionHandler should be registered globally for this function to work
export function handleTokenError(error, exceptionHandler: ExceptionHandler) {
  if (error.name === 'TokenExpiredError') {
    exceptionHandler.throwUnauthorized(_401.TOKEN_EXPIRED);
  } else if (error.name === 'JsonWebTokenError') {
    exceptionHandler.throwUnauthorized(_401.MALFORMED_TOKEN);
  } else {
    exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);
  }
}
