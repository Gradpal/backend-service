import { Injectable } from '@nestjs/common';
import { Complaint } from './entities/complaints.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ClassSessionService } from './class-session.service';
import { _400, _404, _409 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { ComplaintIssueType, ComplaintPriority } from './enums/complaints.enum';
import { ClassSession } from './entities/class-session.entity';
import { User } from '../user/entities/user.entity';
import { EComplaintStatus } from './enums/complaint-status.enum';
import { SessionComplaintReviwDecisionDto } from './dto/complaint-review.dto';
import { EComplaintReviewDecision } from './enums/complaint-review.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
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
      );
    if (complaintExists) {
      this.exceptionHandler.throwBadRequest(_409.COMPLAINT_ALREADY_EXISTS);
    }
    const complaint: Complaint =
      this.complaintRepository.create(createComplaintDto);
    complaint.session = session;

    if (this.issueTypeExistsInIssueTypeEnum(createComplaintDto.issueType)) {
      complaint.priority = ComplaintPriority.HIGH;
    }

    // complaint.evidenceFiles = await this.minioService.uploadAttachments(
    //   [evidenceFile],
    //   complaint.evidenceFiles || [],
    // );
    return this.complaintRepository.save(complaint);
  }

  async existsByDescriptionAndSessionAndIssueTypeAndPriority(
    description: string,
    session: ClassSession,
    issueType: ComplaintIssueType,
  ) {
    const complaint = await this.complaintRepository.findOne({
      where: {
        description: description,
        session: { id: session.id },
        issueType: issueType,
      },
    });
    return !!complaint;
  }

  issueTypeExistsInIssueTypeEnum(issueType: string) {
    return Object.values(ComplaintIssueType).includes(
      issueType as ComplaintIssueType,
    );
  }
  async getMyComplaints(
    user: User,
    status: EComplaintStatus,
    searchKeyword: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const complaints = await this.complaintRepository.find({
      where: [
        {
          session: {
            sessionPackage: {
              tutor: {
                id: user.id,
              },
            },
          },
        },
        {
          session: {
            sessionPackage: {
              student: {
                id: user.id,
              },
            },
          },
        },
      ],
      relations: [
        'session',
        'session.sessionPackage',
        'session.sessionPackage.tutor',
        'session.sessionPackage.student',
      ],
      select: {
        id: true,
        description: true,
        status: true,
        priority: true,
        issueType: true,
        adminNotes: true,
        createdAt: true,
        evidenceFiles: {
          path: true,
          type: true,
          isPreviewPhoto: true,
          name: true,
        },
        teacherReview: {
          message: true,
          evidenceFiles: {
            path: true,
            type: true,
            isPreviewPhoto: true,
            name: true,
          },
        },
        adminReviewDecision: {
          decision: true,
          refundDecision: true,
          evidenceFiles: {
            path: true,
            type: true,
            isPreviewPhoto: true,
            name: true,
          },
        },
      },
    });
    const complaingIds = complaints.map((complaint) => complaint.id);
    if (complaingIds.length <= 0) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const queryBuilder =
      this.complaintRepository.createQueryBuilder('complaint');
    queryBuilder.leftJoinAndSelect('complaint.session', 'session');
    queryBuilder.leftJoinAndSelect('session.sessionPackage', 'sessionPackage');
    queryBuilder.leftJoinAndSelect('sessionPackage.tutor', 'tutor');
    queryBuilder
      .leftJoinAndSelect('sessionPackage.student', 'student')
      .where('complaint.id IN (:...complaingIds)', {
        complaingIds: complaingIds,
      })
      .select([
        'complaint.id',
        'complaint.description',
        'complaint.status',
        'complaint.priority',
        'complaint.issueType',
        'complaint.adminNotes',
        'complaint.createdAt',
        'complaint.updatedAt',
        'complaint.evidenceFiles',
        'complaint.teacherReview',
        'complaint.adminReviewDecision',
        'tutor.id',
        'tutor.firstName',
        'tutor.lastName',
        'tutor.profilePicture',
        'tutor.email',
        'student.firstName',
        'student.lastName',
        'student.profilePicture',
        'student.email',
      ]);
    if (status) {
      queryBuilder.andWhere('complaint.status = :status', { status });
    }
    if (searchKeyword) {
      queryBuilder.andWhere(
        'complaint.description LIKE :searchKeyword OR session.title LIKE :searchKeyword OR student.firstName LIKE :searchKeyword OR student.lastName LIKE :searchKeyword OR tutor.firstName LIKE :searchKeyword OR tutor.lastName LIKE :searchKeyword',
        {
          searchKeyword: `%${searchKeyword}%`,
        },
      );
    }
    const [filteredComplaints, total] = await queryBuilder.getManyAndCount();
    return createPaginatedResponse(filteredComplaints, total, page, limit);
  }

  async getAllComplaints(
    status: EComplaintStatus,
    searchKeyword: string,
    page: number,
    limit: number,
  ) {
    const queryBuilder =
      this.complaintRepository.createQueryBuilder('complaint');
    queryBuilder.leftJoinAndSelect('complaint.session', 'session');
    queryBuilder.leftJoinAndSelect('session.sessionPackage', 'sessionPackage');
    queryBuilder.leftJoinAndSelect('sessionPackage.tutor', 'tutor');
    queryBuilder.leftJoinAndSelect('sessionPackage.student', 'student');
    queryBuilder.select([
      'complaint.id',
      'complaint.description',
      'complaint.status',
      'complaint.priority',
      'complaint.issueType',
      'complaint.adminNotes',
      'complaint.createdAt',
      'complaint.updatedAt',
      'complaint.evidenceFiles',
      'complaint.teacherReview',
      'complaint.adminReviewDecision',
      'tutor.firstName',
      'tutor.lastName',
      'tutor.profilePicture',
      'tutor.email',
      'student.firstName',
      'student.lastName',
      'student.profilePicture',
      'student.email',
    ]);

    if (status) {
      queryBuilder.andWhere('complaint.status = :status', { status });
    }
    if (searchKeyword) {
      queryBuilder.andWhere(
        'complaint.description LIKE :searchKeyword OR session.title LIKE :searchKeyword OR student.firstName LIKE :searchKeyword OR student.lastName LIKE :searchKeyword OR tutor.firstName LIKE :searchKeyword OR tutor.lastName LIKE :searchKeyword',
        {
          searchKeyword: `%${searchKeyword}%`,
        },
      );
    }
    if (page && limit) {
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);
    }
    const [complaints, total] = await queryBuilder.getManyAndCount();
    return createPaginatedResponse(complaints, total, page, limit);
  }
  async getComplaintById(id: string) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: [
        'session',
        'session.sessionPackage',
        'session.sessionPackage.tutor',
        'session.sessionPackage.student',
      ],
    });
    if (!complaint) {
      this.exceptionHandler.throwNotFound(_404.COMPLAINT_NOT_FOUND);
    }
    return complaint;
  }
  async getComplaintDetails(id: string) {
    return this.complaintRepository.findOne({
      where: { id },
      relations: [
        'session',
        'session.sessionPackage',
        'session.subject',
        'session.sessionPackage.tutor',
        'session.sessionPackage.student',
      ],
      select: {
        id: true,
        description: true,
        status: true,
        priority: true,
        issueType: true,
        adminNotes: true,
        createdAt: true,
        evidenceFiles: {
          path: true,
          type: true,
          isPreviewPhoto: true,
          name: true,
        },
        teacherReview: {
          message: true,
          evidenceFiles: {
            path: true,
            type: true,
            isPreviewPhoto: true,
            name: true,
          },
        },
        adminReviewDecision: {
          decision: true,
          refundDecision: true,
          evidenceFiles: {
            path: true,
            type: true,
            isPreviewPhoto: true,
            name: true,
          },
        },
        session: {
          id: true,
          subject: {
            id: true,
            name: true,
          },
          price: true,
          timeSlot: {
            startTime: true,
            endTime: true,
          },
          sessionTimelines: {
            id: true,
            description: true,
            type: true,
            actor: {
              firstName: true,
              lastName: true,
            },
            createdAt: true,
            updatedAt: true,
          },
          meetLink: true,
          status: true,
          sessionPackage: {
            id: true,
            tutor: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              status: true,
              email: true,
            },
            student: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
              profilePicture: true,
              email: true,
            },
          },
        },
      },
    });
  }

  async resolveComplaint(
    complaintId: string,
    resolveComplaintDto: SessionComplaintReviwDecisionDto,
    evidenceFiles: Express.Multer.File[],
  ) {
    const complaint = await this.getComplaintById(complaintId);
    // if (complaint.status !== EComplaintStatus.ADMIN_PENDING) {
    //   this.exceptionHandler.throwBadRequest(_400.COMPLAINT_NOT_PENDING);
    // }
    const evidenceAttachments = await this.minioService.uploadAttachments(
      { files: evidenceFiles },
      [],
    );
    const complaintReviewDecision: SessionComplaintReviwDecisionDto = {
      description: resolveComplaintDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      decision: resolveComplaintDto.decision,
      refundDecision: resolveComplaintDto.refundDecision,
      evidenceFiles: evidenceAttachments,
    };
    if (resolveComplaintDto.decision === EComplaintReviewDecision.ACCEPTED) {
      complaint.status = EComplaintStatus.RESOLVED;
    } else {
      complaint.status = EComplaintStatus.ADMIN_REJECTED;
    }
    complaint.adminReviewDecision = complaintReviewDecision;
    return this.complaintRepository.save(complaint);
  }
}
