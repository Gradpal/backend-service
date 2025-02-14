import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { TypeOfError } from '../constants/errors-constants';

@Injectable()
export class ExceptionHandler {
  constructor() {}

  throwNotFound(type: TypeOfError) {
    throw new NotFoundException(type);
  }

  throwConflict(type: TypeOfError) {
    throw new ConflictException(type);
  }

  throwForbidden(type: TypeOfError) {
    throw new ForbiddenException(type);
  }

  throwBadRequest(type: TypeOfError) {
    throw new BadRequestException(type);
  }

  throwInternalServerError(type: TypeOfError) {
    throw new InternalServerErrorException(type);
  }

  throwServiceUnavailable(type: TypeOfError) {
    throw new ServiceUnavailableException(type);
  }

  throwUnauthorized(type: TypeOfError) {
    throw new UnauthorizedException(type);
  }
}
