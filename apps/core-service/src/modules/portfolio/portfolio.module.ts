import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationRecord } from './entities/education-record.entity';
import { Institution } from './dto/institution.dto';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { CalendarService } from './services/calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { Booking } from '../booking/entities/booking.entity';
import { UserModule } from '../user/user.module';
import { BrainModule } from '@app/common/brain/brain.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Portfolio } from './entities/portfolio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      EducationRecord,
      Institution,
      Booking,
    ]),
    UserModule,
    BrainModule,
    forwardRef(() => SubjectsModule),
  ],
  controllers: [PortfolioController, CalendarController],
  providers: [PortfolioService, CalendarService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
