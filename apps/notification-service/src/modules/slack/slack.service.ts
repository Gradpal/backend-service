import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.webhookUrl =
      'https://hooks.slack.com/services/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';
  }

  async sendMessage(text: string): Promise<boolean> {
    try {
      console.log('=== ======= Sending email to slack channel =====');
      const response = await firstValueFrom(
        this.httpService.post(this.webhookUrl, { text }),
      );

      if (response.status === 200) {
        this.logger.log('Message sent successfully to Slack');
        return true;
      }

      this.logger.error(
        `Failed to send message to Slack: ${response.statusText}`,
      );
      return false;
    } catch (error) {
      this.logger.error(`Error sending message to Slack: ${error.message}`);
      return false;
    }
  }
}
