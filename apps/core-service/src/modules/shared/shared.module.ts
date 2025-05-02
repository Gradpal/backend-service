import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { SubjectTier } from '../subjects/subject-tier/entities/subject-tier.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, SubjectTier, Subject, User])],
  exports: [TypeOrmModule],
})
export class SharedModule {}
