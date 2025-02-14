import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ErrorResponse } from '../dtos/shared.dto';
import { Response, Request } from 'express';
import { TypeORMError } from 'typeorm';
import { _404, _409, _500 } from '../constants/errors-constants';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter<T> {
  constructor(private readonly logger: Logger) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;
    let statusCode: number;
    const time = new Date().toISOString();

    // Log the exception for debugging
    this.logger.error('Exception:', {
      timestamp: time,
      path: request.url,
    });

    console.log(exception);

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ErrorResponse;

      errorResponse = {
        code: exceptionResponse.code || this.getErrorCodeByStatus(statusCode),
        message: exceptionResponse.message || exception.message,
      };
    } else if (exception instanceof RpcException) {
      // Handle RpcException specific errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = this.handleTypeORMError(exception);
    } else if (exception instanceof TypeORMError) {
      // Handle TypeORM specific errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = this.handleTypeORMError(exception);
    } else {
      // Handle unknown exceptions
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        code: _500.INTERNAL_SERVER_ERROR.code,
        message: _500.INTERNAL_SERVER_ERROR.message,
      };
    }

    const errorResponseWithContext = {
      ...errorResponse,
      timestamp: time,
    };

    // In development, include the stack trace
    if (process.env.NODE_ENV !== 'production') {
      errorResponseWithContext['stack'] = this.formatStackTrace(
        exception.stack,
      );
    }

    return response.status(statusCode).json(errorResponseWithContext);
  }

  private handleTypeORMError(error: TypeORMError): ErrorResponse {
    if (error.message.includes('duplicate key')) {
      return _409.DATABASE_RECORD_ALREADY_EXISTS;
    }
    if (error.message.includes('not found')) {
      return _404.DATABASE_RECORD_NOT_FOUND;
    }

    // Handle foreign key violation
    if (error.message.includes('foreign key constraint')) {
      return _409.FOREIGN_KEY_VIOLATION;
    }

    return _500.INTERNAL_SERVER_ERROR;
  }

  private getErrorCodeByStatus(status: number): string {
    const statusCodeMap = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    return statusCodeMap[status] || 'INTERNAL_SERVER_ERROR';
  }

  private formatStackTrace(stack: string): any[] {
    if (!stack) return [];

    return stack
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Parse stack trace line
        const matches = line.match(/^at (.+) \((.+):(\d+):(\d+)\)$/);
        if (matches) {
          return {
            function: matches[1],
            file: matches[2],
            line: parseInt(matches[3], 10),
            column: parseInt(matches[4], 10),
          };
        }

        // Handle anonymous functions or different format
        const simpleLine = line.match(/^at (.+)$/);
        if (simpleLine) {
          return {
            raw: simpleLine[1],
          };
        }

        return { raw: line };
      })
      .filter((frame) => {
        // Filter out noise from the stack trace
        const skipPatterns = [
          'node_modules/express',
          'node_modules/@nestjs',
          'node:internal',
          'node_modules/typescript',
        ];

        if (frame.file) {
          return !skipPatterns.some((pattern) => frame.file.includes(pattern));
        }

        return true;
      })
      .map((frame) => {
        // Add colors and formatting for better readability
        if (frame.file) {
          return {
            ...frame,
            // Clean up file paths
            file: frame.file
              .replace(process.cwd(), '')
              .replace(/^\/?dist\//, '')
              .replace(/\.(js|ts)$/, ''),
          };
        }
        return frame;
      });
  }
}
