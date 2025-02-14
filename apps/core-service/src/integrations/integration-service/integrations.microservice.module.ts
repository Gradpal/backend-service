import { INTERGRATION_PROTO_PATH } from '@app/common/constants/all.constants';
import { INTEGRATION_GRPC_PACKAGE } from '@app/common/constants/services-constants';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: INTEGRATION_GRPC_PACKAGE,
        imports: [CoreServiceConfigModule],
        inject: [CoreServiceConfigService],
        useFactory: (configService: CoreServiceConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: INTEGRATION_GRPC_PACKAGE,
            protoPath: join(process.cwd(), INTERGRATION_PROTO_PATH),
            url: configService.integrationServiceGrpcUrl,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class IntegrationMicroserviceModule {}
