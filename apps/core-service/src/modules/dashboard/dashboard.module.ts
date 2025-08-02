import { forwardRef, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from '../session-package/class-session/entities/class-session.entity';
import { UserModule } from '../user/user.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { User } from '../user/entities/user.entity';
import { SessionPackage } from '../session-package/entities/session-package.entity';
import { TimeSlot } from '../portfolio/weekly-availability/entities/weeky-availability.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassSession,
      User,
      SessionPackage,
      TimeSlot,
      Subject,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => PortfolioModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
