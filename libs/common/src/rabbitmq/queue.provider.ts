import { ClientProxyFactory, Transport } from '@nestjs/microservices';

/**
 * Creates a RabbitMQ client provider
 * @param token - Provider injection token
 * @param queueName - Queue name
 * @param rabbitMQUrl - RabbitMQ connection URL
 */
export const createQueueProvider = (queueName: string, rabbitMQUrl: string) => {
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      queue: queueName,
      queueOptions: {
        durable: true,
      },
    },
  });
};
