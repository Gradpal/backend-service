import { RmqContext, Ctx, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

/**
 * BaseQueueHandler is an abstract class that provides a common structure for handling message queues in a service.
 */
export abstract class BaseQueueHandler<T, R> {
  protected constructor(
    private readonly serviceName: string,
    private readonly service: any,
  ) {}

  /**
   * Handles incoming RabbitMQ messages with acknowledgment and error handling.
   *
   * @param data - The payload data received from the queue of type T
   * @param context - RabbitMQ context containing channel and message information
   * @returns Promise resolving to type R after message processing
   *
   * @remarks
   * This method:
   * 1. Extracts the RabbitMQ channel and original message
   * 2. Logs the received data
   * 3. Processes the message using the abstract processMessage method
   * 4. Acknowledges successful processing
   * 5. Handles errors by negative acknowledgment with requeue
   *
   * @example
   * ```typescript
   * @EventPattern('pattern_name')
   * async handleEmail(@Payload() data: EmailData, @Ctx() context: RmqContext) {
   *   return this.handleMessage(data, context);
   * }
   * ```
   *
   * @throws Error if message processing fails
   */
  async handleMessage(
    @Payload() data: T,
    @Ctx() context: RmqContext,
  ): Promise<R> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      Logger.log(
        `[${this.serviceName}] Received data: ${JSON.stringify(data)}`,
      );

      const result = await this.processMessage(data);

      channel.ack(originalMsg);
      return result;
    } catch (error) {
      channel.nack(originalMsg, false, true); // Requeue message
      Logger.error(`[${this.serviceName}] Processing failed:`, error);
    }
  }

  /**
   * Abstract method to define the custom message processing logic in derived classes.
   * Each subclass must implement this method to process messages according to specific requirements.
   *
   * @param data - The payload of the incoming message.
   * @returns A promise that resolves with the result of processing.
   */
  protected abstract processMessage(data: T): Promise<R>;
}
