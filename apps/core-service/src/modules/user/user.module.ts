import { forwardRef, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { BrainModule } from '@app/common/brain/brain.module';
import { Booking } from '../booking/entities/booking.entity';
import { PortalModule } from '@core-service/portal/portal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    BrainModule,
    MinioClientModule,
    forwardRef(() => PortalModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
