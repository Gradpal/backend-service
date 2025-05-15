import { Injectable } from '@nestjs/common';
import { Complaint } from './entities/complaints.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ClassSessionService } from './class-session.service';
import { _409 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ComplaintIssueType, ComplaintPriority } from './enums/complaints.enum';
import { ClassSession } from './entities/class-session.entity';
import { User } from '../user/entities/user.entity';
@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepository: Repository<Complaint>,
    private readonly minioService: MinioClientService,
    private readonly classSessionService: ClassSessionService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createComplaint(
    createComplaintDto: CreateComplaintDto,
    evidenceFile: Express.Multer.File,
  ) {
    const session = await this.classSessionService.findOne(
      createComplaintDto.sessionId,
    );
    const complaintExists =
      await this.existsByDescriptionAndSessionAndIssueTypeAndPriority(
        createComplaintDto.description,
        session,
        createComplaintDto.issueType,
        createComplaintDto.priority,
      );
    if (complaintExists) {
      this.exceptionHandler.throwBadRequest(_409.COMPLAINT_ALREADY_EXISTS);
    }
    const complaint: Complaint =
      this.complaintRepository.create(createComplaintDto);
    complaint.session = session;

    const evidenceFileUrl =
      await this.minioService.getUploadedFilePath(evidenceFile);

    complaint.evidenceFileUrl = evidenceFileUrl;
    return this.complaintRepository.save(complaint);
  }

  async existsByDescriptionAndSessionAndIssueTypeAndPriority(
    description: string,
    session: ClassSession,
    issueType: ComplaintIssueType,
    priority: ComplaintPriority,
  ) {
    return this.complaintRepository.exists({
      where: {
        description: description,
        session: session,
        issueType: issueType,
        priority: priority,
      },
    });
  }
  async getMyComplaints(user: User) {
    return this.complaintRepository.find({
      where: {
        session: [{ student: { id: user.id } }, { tutor: { id: user.id } }],
      },
      relations: ['session'],
    });
  }
}
