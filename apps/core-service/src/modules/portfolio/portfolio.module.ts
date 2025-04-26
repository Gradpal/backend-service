import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { EducationRecord } from './entities/education-record.entity';
import { Institution } from './dto/institution.dto';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { CalendarService } from './services/calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { Booking } from '../booking/entities/booking.entity';
import { UserModule } from '../user/user.module';
import { BrainModule } from '@app/common/brain/brain.module';

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
  ],
  controllers: [PortfolioController, CalendarController],
  providers: [PortfolioService, CalendarService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
