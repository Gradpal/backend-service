import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from './entities/class-session.entity';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UserService } from '../user/user.service';
import { ESessionStatus } from './enums/session-status.enum';
import { MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ClassSessionService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly userService: UserService,
  ) {}

  async create(
    createClassSessionDto: CreateClassSessionDto,
  ): Promise<ClassSession> {
    const { tutorId, studentId, ...sessionData } = createClassSessionDto;

    const tutor = await this.userService.findOne(tutorId);
    const student = await this.userService.findOne(studentId);

    if (!tutor || !student) {
      throw new NotFoundException('Tutor or student not found');
    }

    const session = this.classSessionRepository.create({
      ...sessionData,
      tutor,
      student,
      status: ESessionStatus.SCHEDULED,
    });

    return this.classSessionRepository.save(session);
  }

  async findAll(): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      relations: ['tutor', 'student'],
    });
  }

  async findOne(id: string): Promise<ClassSession> {
    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations: ['tutor', 'student'],
    });

    if (!session) {
      throw new NotFoundException(`Class session with ID ${id} not found`);
    }

    return session;
  }

  async update(
    id: string,
    updateData: Partial<CreateClassSessionDto>,
  ): Promise<ClassSession> {
    const session = await this.findOne(id);

    if (updateData.tutorId) {
      const tutor = await this.userService.findOne(updateData.tutorId);
      if (!tutor) {
        throw new NotFoundException('Tutor not found');
      }
      session.tutor = tutor;
    }

    if (updateData.studentId) {
      const student = await this.userService.findOne(updateData.studentId);
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      session.student = student;
    }

    Object.assign(session, updateData);
    return this.classSessionRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.classSessionRepository.remove(session);
  }

  async findByTutor(tutorId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { tutor: { id: tutorId } },
      relations: ['tutor', 'student'],
    });
  }

  async findByStudent(studentId: string): Promise<ClassSession[]> {
    return this.classSessionRepository.find({
      where: { student: { id: studentId } },
      relations: ['tutor', 'student'],
    });
  }

  async updateStatus(
    id: string,
    status: ESessionStatus,
  ): Promise<ClassSession> {
    const session = await this.findOne(id);
    session.status = status;
    return this.classSessionRepository.save(session);
  }

  async getTopUpcomingSessions(student: User): Promise<ClassSession[]> {
    const currentDate = new Date();

    return this.classSessionRepository.find({
      where: {
        student: {
          id: student.id,
        },
        scheduled_time: MoreThanOrEqual(currentDate),
        status: ESessionStatus.SCHEDULED,
      },
      relations: ['tutor', 'student'],
      order: {
        scheduled_time: 'ASC',
      },
      take: 3,
    });
  }
}
