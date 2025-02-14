import { RpcException } from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { GrpcErrorType } from '../constants/grpc-errors.constants';

@Injectable()
export class GrpcExceptionHandler {
  throwGrpcError(error: GrpcErrorType) {
    throw new RpcException({
      code: error.code,
      message: error.message,
    });
  }
}
