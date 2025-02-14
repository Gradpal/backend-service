import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';

@Global()
@Module({
  providers: [MinioClientService, CoreServiceConfigService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
