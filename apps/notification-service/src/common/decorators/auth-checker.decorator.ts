import {
  applyDecorators,
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { MessageOwner } from '@notification-service/modules/chat/dtos/message-owner.dto';

class AuthChecker implements NestInterceptor {
  private readonly logger = new Logger('RequestLogger');
  private readonly jwtService = new JwtService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: 'secret' });
      const user = new MessageOwner();
      user.id = payload.id;
      user.firstName = payload.firstName;
      user.lastName = payload.lastName;
      user.role = payload.role;
      user.profilePicture = payload.profilePicture;

      this.logger.log(`Request logged for user: ${payload.id}`);
      request.user = user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return next.handle();
  }
}

export function AuthUser() {
  return applyDecorators(UseInterceptors(AuthChecker));
}
