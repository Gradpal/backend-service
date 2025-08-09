import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './dto/env-variable.dto';

@Injectable()
export class HocusPocusServiceConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get port(): number {
    return this.configService.getOrThrow('HOCUS_POCUS_SERVICE_PORT');
  }

  get environment(): string {
    return this.configService.getOrThrow('NODE_ENV');
  }

  get grpcUrl(): string {
    return this.configService.getOrThrow('GRPC_URL');
  }

  get hocusPocusServerPort(): number {
    return this.configService.getOrThrow('HOCUS_POCUS_SERVER_PORT');
  }
}
