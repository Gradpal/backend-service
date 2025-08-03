import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DB_ROOT_NAMES } from '@notification-service/common/constants/typeorm-config.constant';
import { NotificationUserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User], DB_ROOT_NAMES.CHAT)],
  exports: [NotificationUserService],
  controllers: [UserController],
  providers: [NotificationUserService],
})
export class NotificationUserModule {}
