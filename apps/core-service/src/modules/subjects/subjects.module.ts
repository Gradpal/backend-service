import { Module, forwardRef } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { SubjectTierService } from './subject-tier/subject-tier.service';
import { SubjectTierController } from './subject-tier/subject-tier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectTier } from './subject-tier/entities/subject-tier.entity';
import { Subject } from './entities/subject.entity';
import { User } from '../user/entities/user.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ClassSessionModule } from '../session-package/class-session/class-session.module';
import { SubjectCategory } from './entities/subject-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      SubjectTier,
      User,
      Portfolio,
      SubjectCategory,
    ]),
    forwardRef(() => PortfolioModule),
    forwardRef(() => ClassSessionModule),
  ],
  providers: [SubjectsService, SubjectTierService, ExceptionHandler],
  controllers: [SubjectsController, SubjectTierController],
  exports: [SubjectsService, SubjectTierService],
})
export class SubjectsModule {}
