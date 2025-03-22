import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Tutor } from './entities/tutor.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { MinioClientService } from '../minio-client/minio-client.service';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly minioService: MinioClientService,
  ) {}
  async create(user: User) {
    let tutor = await this.tutorRepository.create({
      profile: user,
    });
    return await this.tutorRepository.save(tutor);
  }

  async updateProfile(user: User, updates: UpdateTutorProfileDto) {
    let tutor = await this.tutorRepository.findOne({
      where: {
        profile: {
          id: user.id,
        },
      },
    });
    if (!tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    let newUpdates: any = {
      ...updates,
    };

    if (updates.introductory_video) {
      const fileUrl = await this.minioService.uploadFile(
        updates.introductory_video,
      );
      newUpdates.introductory_video = fileUrl;
    }
    if (newUpdates.institutions) {
      for (const institution of newUpdates.institutions) {
        if (institution.academic_transcript) {
          const transcriptUrl = await this.minioService.uploadFile(
            institution.academic_transcript,
          );
          institution.academic_transcript = transcriptUrl;
        }
        if (institution.degree_certificate) {
          const certificateUrl = await this.minioService.uploadFile(
            institution.degree_certificate,
          );
          institution.degree_certificate = certificateUrl;
        }
      }
      newUpdates.institutions = updates.institutions;
    }

    return await this.tutorRepository.update(tutor.id, newUpdates);
  }
}
