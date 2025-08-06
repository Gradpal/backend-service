import { Module } from '@nestjs/common';
import { AutonomousServiceService } from './autonomous-service.service';
import { AutonomousServiceController } from './autonomous-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutonomousService } from './entities/autonomous-service.entity';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Bid } from './entities/bid.entity';
import { UserModule } from '../user/user.module';
import { Invitation } from './entities/invitation.entity';
import { TimeSlot } from '../portfolio/weekly-availability/entities/weeky-availability.entity';
import { IntroductoryMeetingBooking } from './entities/introductory-meeting-booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutonomousService,
      Bid,
      Invitation,
      TimeSlot,
      IntroductoryMeetingBooking,
    ]),
    MinioClientModule,
    SubjectsModule,
    UserModule,
  ],
  exports: [AutonomousServiceService],
  providers: [AutonomousServiceService],
  controllers: [AutonomousServiceController],
})
export class AutonomousServiceModule {}
