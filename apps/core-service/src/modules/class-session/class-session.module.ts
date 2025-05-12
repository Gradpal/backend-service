import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSessionService } from './class-session.service';
import { ClassSessionController } from './class-session.controller';
import { ClassSession } from './entities/class-session.entity';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession]),
    forwardRef(() => PortfolioModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ClassSessionController],
  providers: [ClassSessionService, ExceptionHandler],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
