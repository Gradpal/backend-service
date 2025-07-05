import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioClientController } from './minio-client.controller';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';

@Global()
@Module({
  controllers: [MinioClientController],
  providers: [MinioClientService, CoreServiceConfigService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
