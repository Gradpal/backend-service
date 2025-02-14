import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { CoreServiceConfigService } from './configs/core-service-config.service';
import { AppEnvironment } from './configs/dto/env-variables.dto';
import {
  APP_BASE_PATH,
  APP_NAME,
  SWAGGER_DOCUMENTATION_PATH,
} from './common/constants/all.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { CORE_GRPC_PACKAGE } from '@app/common/constants/services-constants';
import { CORE_PROTO_PATH } from '@app/common/constants/all.constants';
import { ReflectionService } from '@grpc/reflection';

export const setupCoreConfig = async (app: INestApplication) => {
  const isProdMode =
    app.get(CoreServiceConfigService).environment == AppEnvironment.Production;

  enableValidationPipe(app);
  enableGRPC(app);

  app.setGlobalPrefix(APP_BASE_PATH); // 👈 this should be loaded before swagger docs, otherwise app base path won't be included in swagger docs

  app.useLogger(app.get(Logger)); // set global logger

  /** docs: Swagger docs to load it's assets bundle needs to be enable before helmet **/
  if (!isProdMode) enableOpenApiDocumentation(app);

  app.use(cookieParser());

  enableSecurity(app);

  app.enableCors({
    origin: !isProdMode ? '*' : '*', //TODO: before we go production we need to change this to the actual domain,
    methods: '*',
  });

  //This is important to make sure the connection to Kafka get stopped before restart. superfast⚡️ on reconnection
  app.enableShutdownHooks();
};

/**
 * This is wherer we put all the security features for our applications.
 * Throttling,
 *
 */
const enableSecurity = async (app: INestApplication) => {
  app.use(
    helmet({
      hidePoweredBy: true,
      xssFilter: true,
    }),
  );
};

const enableValidationPipe = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

export function validationExceptionFactory(errors: ValidationError[]) {
  const messages = errors.map(
    (error) =>
      `${error.property} - ${Object.values(error.constraints).join(', ')}`,
  );
  return new BadRequestException(messages);
}

/**
 * This will enable the auto-documentation of apis.
 * @param app
 */
const enableOpenApiDocumentation = (app: INestApplication) => {
  const isProduction =
    app.get(CoreServiceConfigService).environment == AppEnvironment.Production;

  if (isProduction) return;

  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME.split('-').join(' ')}`)
    .addTag('Auth')
    .setDescription('The Core Service API Documentation. 🚀🚀🚀')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [], //Added extra schemas.
  });

  SwaggerModule.setup(SWAGGER_DOCUMENTATION_PATH, app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
};

const enableGRPC = async (app: INestApplication) => {
  const logger = app.get(Logger);

  const grpcPort = app.get(CoreServiceConfigService).GrpcPort;
  const grpcHost = app.get(CoreServiceConfigService).GrpcHost;
  const url = `${grpcHost}:${grpcPort}`;

  const protoPath = join(process.cwd(), CORE_PROTO_PATH);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: CORE_GRPC_PACKAGE,
      protoPath,
      url,
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
        logger.log(`${APP_NAME} gRPC is running on ${grpcHost}:${grpcPort} 🚀`);
      },
    },
  });
};
