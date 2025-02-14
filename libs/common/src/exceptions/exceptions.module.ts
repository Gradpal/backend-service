import { Global, Module } from '@nestjs/common';
import { ExceptionHandler } from './exceptions.handler';
import { GrpcExceptionHandler } from './grpc-exceptions.handler';

@Global()
@Module({
  imports: [],
  providers: [ExceptionHandler, GrpcExceptionHandler],
  exports: [ExceptionHandler, GrpcExceptionHandler],
})
export class ExceptionModule {}
