import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Tutor } from './entities/tutor.entity';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
  ) {}
  async create(user: User) {
    let student = await this.tutorRepository.create({
      profile: user,
    });
    return await this.tutorRepository.save(student);
  }
}
