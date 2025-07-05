import {
  CORE_PROTO_PATH,
  CORE_GRPC_PACKAGE,
} from '@app/common/constants/services-constants';
import { join } from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Global, Module } from '@nestjs/common';
import { NotificationConfigService } from '@notification-service/configs/notification-config.service';
import { NotificationConfigModule } from '@notification-service/configs/notification-config.module';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CORE_GRPC_PACKAGE,
        imports: [NotificationConfigModule],
        inject: [NotificationConfigService],
        useFactory: (configService: NotificationConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: CORE_GRPC_PACKAGE,
            protoPath: join(process.cwd(), CORE_PROTO_PATH),
            url: configService.coreGrpcUrl,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class CoreServiceIntegrationModule {}
