import {
  LOGGED_IN_USER_KEY,
  ROLE_GUARD_KEY,
} from '@core-service/common/constants/all.constants';
import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { User } from '../modules/user/entities/user.entity';

export const PreAuthorize = (...roles: string[]) =>
  SetMetadata(ROLE_GUARD_KEY, roles);

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
