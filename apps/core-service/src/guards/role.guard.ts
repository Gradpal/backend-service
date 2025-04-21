import { _401, _403 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ROLE_GUARD_KEY } from '@core-service/common/constants/all.constants';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { handleTokenError } from './helper';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(CoreServiceConfigService)
    private readonly configService: CoreServiceConfigService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLE_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    if (!authorization)
      this.exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);

    const token = req.headers.authorization;
    if (token && !token.startsWith('Bearer ')) {
      this.exceptionHandler.throwUnauthorized(_401.MALFORMED_TOKEN);
    }

    const tokenValue = token.split(' ')[1];
    try {
      const decodedToken = this.jwtService.verify(tokenValue, {
        secret: this.configService.jwtSecret,
      });
      if (requiredRoles.includes(decodedToken.role)) {
        console.log(decodedToken, '---->');
        req.user = decodedToken;
        return true;
      }
    } catch (error) {
      handleTokenError(error, this.exceptionHandler);
    }
    this.exceptionHandler.throwForbidden(_403.UNAUTHORIZED);
    return false;
  }
}
