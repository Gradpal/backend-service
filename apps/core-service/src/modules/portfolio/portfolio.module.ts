import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from './entities/portfolio.entity';
import { EducationInstitutionRecord } from './entities/education-record.entity';
import { Institution } from './dto/institution.dto';
import { Booking } from '../booking/entities/booking.entity';
import { UserModule } from '../user/user.module';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ClassSessionModule } from '../class-session/class-session.module';
import { DaySchedule } from './weekly-availability/entities/weeky-availability.entity';
import { TimeSlot } from './weekly-availability/entities/weeky-availability.entity';
import { WeeklyAvailability } from './weekly-availability/entities/weeky-availability.entity';
import { WeeklyAvailabilityService } from './weekly-availability/weekly-availability';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      EducationInstitutionRecord,
      Institution,
      Booking,
      WeeklyAvailability,
      DaySchedule,
      TimeSlot,
    ]),
    UserModule,
    MinioClientModule,
    forwardRef(() => SubjectsModule),
    forwardRef(() => ClassSessionModule),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, ExceptionHandler, WeeklyAvailabilityService],
  exports: [PortfolioService, WeeklyAvailabilityService],
})
export class PortfolioModule {}
