import { Module } from '@nestjs/common';
import { EmailNotifierService } from './email-notifier.service';
import { EmailNotifierController } from './email-notifier.controller';

@Module({
  controllers: [EmailNotifierController],
  providers: [EmailNotifierService],
})
export class EmailNotifierModule {}
