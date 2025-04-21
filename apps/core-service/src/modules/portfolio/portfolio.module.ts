import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { UserModule } from '../user/user.module';
import { Institution } from './entities/institution.entity';
import { EducationRecord } from './entities/education-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio, Institution, EducationRecord]),
    UserModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
