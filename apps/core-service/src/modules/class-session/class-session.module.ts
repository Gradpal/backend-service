import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSessionService } from './class-session.service';
import { ClassSessionController } from './class-session.controller';
import { ClassSession } from './entities/class-session.entity';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { UserModule } from '../user/user.module';
import { Complaint } from './entities/complaints.entity';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { MinioClientService } from '../minio-client/minio-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession, Complaint]),
    forwardRef(() => PortfolioModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ClassSessionController, ComplaintsController],
  providers: [
    ClassSessionService,
    ExceptionHandler,
    ComplaintsService,
    MinioClientService,
  ],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
