import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { NotificationServiceModule } from './notification-service.module';
import { APP_NAME } from './common/constants/all.constants';
import { NotificationConfigService } from './configs/notification-config.service';
import { setUpNotificationConfig } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  setUpNotificationConfig(app);

  const port = app.get(NotificationConfigService).port;
  const logger = app.get(Logger);

  // // Start all microservices before listening on the main port
  // await app.startAllMicroservices();

  await app.listen(port, () => {
    logger.log(`${APP_NAME} is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
