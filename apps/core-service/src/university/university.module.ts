import { Module } from '@nestjs/common';
import { UniversityService } from './university.service';
import { UniversityController } from './university.controller';
import { University } from './entities/university.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  providers: [UniversityService],
  controllers: [UniversityController],
})
export class UniversityModule {}
