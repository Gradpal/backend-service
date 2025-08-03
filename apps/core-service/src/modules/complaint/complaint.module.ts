import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Complaint } from './entities/complaints.entity';
import { ComplaintsService } from './complaints.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ClassSessionModule } from '../session-package/class-session/class-session.module';
import { AutonomousServiceModule } from '../autonomous-service/autonomous-service.module';
import { ComplaintsController } from './complaints.controller';
import { AutonomousService } from '../autonomous-service/entities/autonomous-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint, AutonomousService]),
    forwardRef(() => ClassSessionModule),
    forwardRef(() => AutonomousServiceModule),
    forwardRef(() => UserModule),
    forwardRef(() => PortfolioModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => UserModule),
  ],
  providers: [ComplaintsService, ExceptionHandler, MinioClientService],
  controllers: [ComplaintsController],
  exports: [ComplaintsService],
})
export class ComplaintModule {}
