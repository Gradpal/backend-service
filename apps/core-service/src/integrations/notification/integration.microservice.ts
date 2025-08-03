import {
  NOTIFICATION_PROTO_PATH,
  NOTIFICATION_GRPC_PACKAGE,
} from '@app/common/constants/services-constants';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_GRPC_PACKAGE,
        imports: [CoreServiceConfigModule],
        inject: [CoreServiceConfigService],
        useFactory: (configService: CoreServiceConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: NOTIFICATION_GRPC_PACKAGE,
            protoPath: join(process.cwd(), NOTIFICATION_PROTO_PATH),
            url: configService.notificationGrpcUrl,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NotificationIntegrationModule {}
