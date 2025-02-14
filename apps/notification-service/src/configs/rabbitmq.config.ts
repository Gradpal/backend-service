import { NOTIFICATION_QUEUE_NAMES } from '@app/common/constants/rabbitmq-constants';
import { NotificationConfigService } from './notification-config.service';

export const createRabbitMQConfig = (
  configService: NotificationConfigService,
) => ({
  url: configService.rabbitmqUri,
  queues: NOTIFICATION_QUEUE_NAMES,
});
