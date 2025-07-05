import { Module } from '@nestjs/common';
import { EmailNotifierService } from './email-notifier.service';
import { EmailNotifierController } from './email-notifier.controller';
import { SlackModule } from '../../slack/slack.module';
@Module({
  imports: [SlackModule],
  controllers: [EmailNotifierController],
  providers: [EmailNotifierService],
})
export class EmailNotifierModule {}
