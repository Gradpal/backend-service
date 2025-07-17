import { Module } from '@nestjs/common';
import { AutonomousServiceService } from './autonomous-service.service';
import { AutonomousServiceController } from './autonomous-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutonomousService } from './entities/autonomous-service.entity';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AutonomousService, Bid]),
    MinioClientModule,
    SubjectsModule,
  ],
  exports: [AutonomousServiceService],
  providers: [AutonomousServiceService],
  controllers: [AutonomousServiceController],
})
export class AutonomousServiceModule {}
