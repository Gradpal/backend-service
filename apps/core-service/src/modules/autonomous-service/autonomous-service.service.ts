import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutonomousService } from './entities/autonomous-service.entity';
import { CreateAutonomousServiceDto } from './dtos/create-autonomous-service.dto';
import { MinioClientService } from '@core-service/modules/minio-client/minio-client.service';
import { SubjectsService } from '../subjects/subjects.service';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _409 } from '@app/common/constants/errors-constants';
import { normalizeArray } from '@core-service/common/helpers/all.helpers';

@Injectable()
export class AutonomousServiceService {
  constructor(
    @InjectRepository(AutonomousService)
    private autonomousServiceRepository: Repository<AutonomousService>,
    private readonly minioClientService: MinioClientService,
    private readonly subjectService: SubjectsService,
    private readonly exceptionHander: ExceptionHandler,
  ) {}

  async createAutonomousService(
    createAutonomousServiceDto: CreateAutonomousServiceDto,
    loggedInUser: User,
    files: Express.Multer.File[],
  ): Promise<AutonomousService> {
    const existingAutonomousService = await this.existsByTitle(
      createAutonomousServiceDto.projectTitle,
    );
    if (existingAutonomousService) {
      this.exceptionHander.throwConflict(
        _409.AUTONOMOUS_SERVICE_ALREADY_EXISTS,
      );
    }
    const subject = await this.subjectService.getSubjectById(
      createAutonomousServiceDto.subjectId,
    );

    createAutonomousServiceDto.preferredOutputFormats = normalizeArray(
      createAutonomousServiceDto.preferredOutputFormats,
    );
    const autonomousService = this.autonomousServiceRepository.create({
      ...createAutonomousServiceDto,
      subject,
      owner: loggedInUser,
    });
    if (files.length > 0) {
      autonomousService.attachments =
        await this.minioClientService.uploadAttachments(files, []);
    }
    return await this.autonomousServiceRepository.save(autonomousService);
  }

  async getAutonomousServiceById(id: string): Promise<AutonomousService> {
    return await this.autonomousServiceRepository.findOne({
      where: { id },
    });
  }

  async existsByTitle(title: string): Promise<boolean> {
    const autonomousService = await this.autonomousServiceRepository.findOne({
      where: { projectTitle: title },
    });
    return !!autonomousService;
  }
}
