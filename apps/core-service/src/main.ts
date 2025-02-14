import { NestFactory } from '@nestjs/core';
import { CoreServiceModule } from './core-service.module';
import { setupCoreConfig } from './setup';
import { CoreServiceConfigService } from './configs/core-service-config.service';
import { Logger } from 'nestjs-pino';
import { APP_NAME } from './common/constants/all.constants';
import { install } from 'source-map-support';
install();

async function bootstrap() {
  const app = await NestFactory.create(CoreServiceModule);

  await setupCoreConfig(app);
  await app.startAllMicroservices();

  const port = app.get(CoreServiceConfigService).port;
  const logger = app.get(Logger);

  await app.listen(port, () => {
    logger.log(`${APP_NAME} Rest is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
