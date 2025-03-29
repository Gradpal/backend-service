import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { SavedTutor } from './entities/saved-tutor.entity';
import { Tutor } from '../tutor/entities/tutor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, User, SavedTutor, Tutor]),
    UserModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
