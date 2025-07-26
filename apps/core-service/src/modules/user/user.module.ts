import { forwardRef, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { BrainModule } from '@app/common/brain/brain.module';
import { Booking } from '../booking/entities/booking.entity';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { PortalModule } from '@core-service/modules/portal/portal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    BrainModule,
    MinioClientModule,
    PortalModule,
    // forwardRef(() => PortalModule),
    forwardRef(() => PortfolioModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
