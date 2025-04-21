import { forwardRef, Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { Tutor } from './entities/tutor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { User } from '../user/entities/user.entity';
import { Booking } from '../booking/entities/booking.entity';
import { CalendarController } from './controllers/calendar.controller';
import { GoogleCalendarService } from './services/google-calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tutor, User, Booking]),
    forwardRef(() => UserModule),
    MinioClientModule,
  ],
  providers: [TutorService, GoogleCalendarService],
  controllers: [TutorController, CalendarController],
  exports: [TutorService, TypeOrmModule],
})
export class TutorModule {}
