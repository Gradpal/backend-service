import { Module } from '@nestjs/common';
import { SessionPackageController } from './session-package.controller';
import { SessionPackageService } from './session-package.service';

@Module({
  controllers: [SessionPackageController],
  providers: [SessionPackageService]
})
export class SessionPackageModule {}
