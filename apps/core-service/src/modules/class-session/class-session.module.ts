import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSessionService } from './class-session.service';
import { ClassSessionController } from './class-session.controller';
import { ClassSession } from './entities/class-session.entity';
import { UserModule } from '../user/user.module';
import { SubjectsModule } from '../subjects/subjects.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession]),
    UserModule,
    SubjectsModule,
  ],
  controllers: [ClassSessionController],
  providers: [ClassSessionService],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
