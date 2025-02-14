import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
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
import { NotificationConfigService } from './configs/notification-config.service';
import { createRabbitMQConfig } from './configs/rabbitmq.config';
import { NOTIFICATION_QUEUE_NAMES } from '@app/common/constants/rabbitmq-constants';
import { Transport } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';

export const setUpNotificationConfig = async (app: INestApplication) => {
  const isProdMode =
    app.get(NotificationConfigService).environment == AppEnvironment.Production;

  enableValidationPipe(app);

  app.setGlobalPrefix(APP_BASE_PATH); // 👈 this should be loaded before swagger docs, otherwise app base path won't be included in swagger docs

  app.useLogger(app.get(Logger)); // set global logger

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  /** docs: Swagger docs to load it's assets bundle needs to be enable before helmet **/
  if (!isProdMode) enableOpenApiDocumentation(app);

  app.use(cookieParser());

  configureRabbitMQ(app);

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
    app.get(NotificationConfigService).environment == AppEnvironment.Production;

  if (isProduction) return;

  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME.split('-').join(' ')}`)
    .setDescription('The iIntergration Service API Documentation. 🚀🚀🚀')
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

const configureRabbitMQ = async (app: INestApplication) => {
  const configService = app.get(NotificationConfigService);
  const rmqConfig = createRabbitMQConfig(configService);

  // Configure microservices for each queue
  const microserviceConfigs = Object.values(NOTIFICATION_QUEUE_NAMES).map(
    (queue) => ({
      transport: Transport.RMQ,
      options: {
        urls: [rmqConfig.url],
        queue: queue,
        noAck: false, // Ensure that messages are not lost without being processed
        queueOptions: {
          durable: true,
        },
      },
    }),
  );

  // Connect all microservices
  microserviceConfigs.forEach((config) => {
    app.connectMicroservice(config);
  });

  await app.startAllMicroservices();
};
