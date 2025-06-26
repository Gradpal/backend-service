import { Module } from '@nestjs/common';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NationalPortal } from './entities/national-portal.entity';
import { UserModule } from '@core-service/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([NationalPortal]), UserModule],
  providers: [PortalService],
  controllers: [PortalController],
})
export class PortalModule {}
