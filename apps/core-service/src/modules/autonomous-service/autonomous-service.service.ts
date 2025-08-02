import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { AutonomousService } from './entities/autonomous-service.entity';
import { CreateAutonomousServiceDto } from './dtos/create-autonomous-service.dto';
import { MinioClientService } from '@core-service/modules/minio-client/minio-client.service';
import { SubjectsService } from '../subjects/subjects.service';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { normalizeArray } from '@core-service/common/helpers/all.helpers';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { PaginatedResponse } from '@app/common/dtos/pagination.response';
import { SubmitBidDto } from './dtos/submit-bid.dto';
import { Bid } from './entities/bid.entity';
import { EUserRole } from '../user/enums/user-role.enum';
import { EBidStatus } from './enums/bid-status.enum';
import { EAutonomousServiceStatus } from './enums/autonomous-service-status.enum';
import { SessionReviewDto } from '../class-session/dto/session-review.dto';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { UserService } from '../user/user.service';
import { EInvitationStatus } from './enums/invitation-status.enum';
import { Invitation } from './entities/invitation.entity';
import { UpdateInvitationStageDto } from './dtos/invitation-dto';

@Injectable()
export class AutonomousServiceService {
  constructor(
    @InjectRepository(AutonomousService)
    private autonomousServiceRepository: Repository<AutonomousService>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private readonly minioClientService: MinioClientService,
    private readonly subjectService: SubjectsService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly userService: UserService,
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
      this.exceptionHandler.throwConflict(
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
      student: loggedInUser,
    });
    if (files.length > 0) {
      autonomousService.attachments =
        await this.minioClientService.uploadAttachments({ files }, []);
    }
    return await this.autonomousServiceRepository.save(autonomousService);
  }

  async getAllServices(
    searchKeyword: string,
    status: EAutonomousServiceStatus,
    limit: number,
    page: number,
    loggedInUser: User,
  ): Promise<PaginatedResponse<AutonomousService>> {
    const whereClause: FindOptionsWhere<AutonomousService> = {
      status: status,
    };
    if (loggedInUser.role === EUserRole.TUTOR) {
      whereClause.invitations = {
        tutor: {
          id: loggedInUser.id,
        },
        status: EInvitationStatus.PENDING,
      };
    } else {
      whereClause.student = {
        id: loggedInUser.id,
      };
    }
    const autonomousServces = await this.autonomousServiceRepository.find({
      where: whereClause,
      relations: ['invitations'],
      select: {
        id: true,
      },
    });
    const serviceIds = autonomousServces.map((service) => service.id);
    if (serviceIds.length <= 0) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const query = this.autonomousServiceRepository
      .createQueryBuilder('autonomousService')
      .leftJoinAndSelect('autonomousService.subject', 'subject')
      .leftJoinAndSelect('autonomousService.student', 'student')
      .leftJoinAndSelect('autonomousService.bids', 'bids')
      .leftJoinAndSelect('autonomousService.invitations', 'invitations')
      .leftJoinAndSelect('invitations.tutor', 'tutor')
      .where('autonomousService.id IN (:...serviceIds)', { serviceIds });

    if (searchKeyword) {
      query.andWhere('autonomousService.projectTitle ILIKE :searchKeyword', {
        searchKeyword: `%${searchKeyword}%`,
      });
    }
    if (status) {
      query.andWhere('autonomousService.status = :status', { status: status });
    }
    query.orderBy('autonomousService.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);
    query.select([
      'autonomousService.id',
      'autonomousService.projectTitle',
      'autonomousService.description',
      'autonomousService.status',
      'autonomousService.isOwnerAnonymous',
      'autonomousService.contractFinalizationDate',
      'autonomousService.finalSubmissionDate',
      'autonomousService.preferredOutputFormats',
      'autonomousService.attachments',
      'autonomousService.createdAt',
      'subject.id',
      'subject.name',
      'student.id',
      'student.firstName',
      'student.lastName',
      'student.profilePicture',
      'student.email',
      'bids.id',
      'bids.bidAmount',
      'bids.description',
      'bids.status',
      'bids.createdAt',
      'bids.updatedAt',
      'invitations.id',
      'invitations.status',
      'invitations.createdAt',
      'invitations.updatedAt',
      'tutor.id',
      'tutor.firstName',
      'tutor.lastName',
      'tutor.email',
      'tutor.profilePicture',
    ]);
    const [services, total] = await query.getManyAndCount();
    return createPaginatedResponse(services, total, page, limit);
  }

  async getAutonomousServiceById(id: string): Promise<AutonomousService> {
    const service = await this.autonomousServiceRepository.findOne({
      where: { id },
      relations: [
        'subject',
        'student',
        'bids',
        'invitations',
        'invitations.tutor',
      ],
      select: {
        id: true,
        projectTitle: true,
        description: true,
        status: true,
        isOwnerAnonymous: true,
        contractFinalizationDate: true,
        finalSubmissionDate: true,
        preferredOutputFormats: true,
        attachments: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          id: true,
          name: true,
        },
        student: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
        bids: {
          id: true,
          bidAmount: true,
          teacherCounterbidAmount: true,
          studentCounterbidAmount: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        invitations: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          tutor: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });
    if (!service) {
      this.exceptionHandler.throwNotFound(_404.AUTONOMOUS_SERVICE_NOT_FOUND);
    }
    return service;
  }

  async existsByTitle(title: string): Promise<boolean> {
    const autonomousService = await this.autonomousServiceRepository.findOne({
      where: { projectTitle: title },
    });
    return !!autonomousService;
  }

  // bid

  async getBidById(bidId: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['autonomousService'],
    });
    if (!bid) {
      this.exceptionHandler.throwNotFound(_404.BID_NOT_FOUND);
    }
    return bid;
  }

  async submitBid(
    submitBidDto: SubmitBidDto,
    serviceId: string,
    loggedInUser: User,
  ) {
    const [autonomousService] = await Promise.all([
      this.getAutonomousServiceById(serviceId),
    ]);
    const bid = this.bidRepository.create({
      bidAmount: submitBidDto.bidAmount,
      description: submitBidDto.description,
      autonomousService,
      user: {
        id: loggedInUser.id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        email: loggedInUser.email,
      },
    });
    autonomousService.status = EAutonomousServiceStatus.BIDS_SUBMITTED;
    const [updatedBid, updatedService] = await Promise.all([
      this.bidRepository.save(bid),
      this.autonomousServiceRepository.save(autonomousService),
    ]);
    return {
      bid: updatedBid,
      service: updatedService,
    };
  }

  async submitCounterBid(
    submitCounterBidDto: SubmitBidDto,
    bidId: string,
    loggedInUser: User,
  ) {
    const bid = await this.getBidById(bidId);
    if (loggedInUser.role === EUserRole.TUTOR) {
      bid.teacherCounterbidAmount = submitCounterBidDto.bidAmount;
    } else {
      bid.studentCounterbidAmount = submitCounterBidDto.bidAmount;
    }
    return await this.bidRepository.save(bid);
  }

  async acceptOrRejectBid(bidId: string, action: EBidStatus, user: User) {
    const bid = await this.getBidById(bidId);
    if (action === EBidStatus.ACCEPTED) {
      bid.status = EBidStatus.ACCEPTED;
      if (user.role === EUserRole.STUDENT) {
        bid.autonomousService.status = EAutonomousServiceStatus.IN_PROGRESS;
      }
    } else {
      bid.status = EBidStatus.REJECTED;
    }
    const [updatedBid, updatedService] = await Promise.all([
      this.bidRepository.save(bid),
      this.autonomousServiceRepository.save(bid.autonomousService),
    ]);
    return {
      bid: updatedBid,
      service: updatedService,
    };
  }
  async reviewBid(serviceId: string, review: SessionReviewDto) {
    const service = await this.getAutonomousServiceById(serviceId);
    service.review = review;
    service.status = EAutonomousServiceStatus.COMPLETED;
    return await this.autonomousServiceRepository.save(service);
  }

  async inviteTutor(createInvitationDto: CreateInvitationDto, tutorId: string) {
    const tutor = await this.userService.findOne(tutorId);
    const services = await this.autonomousServiceRepository.find({
      where: { id: In(createInvitationDto.serviceIds) },
    });

    services.forEach(async (service) => {
      const invitation = this.invitationRepository.create({
        autonomousService: service,
        status: createInvitationDto.inviteDirectly
          ? EInvitationStatus.PENDING
          : EInvitationStatus.INITIATED,
        tutor,
      });
      await this.invitationRepository.save(invitation);
    });
  }

  async getInvitations(serviceId?: string, status?: EInvitationStatus) {
    const query = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.autonomousService', 'autonomousService')
      .leftJoinAndSelect('invitation.tutor', 'tutor');

    if (serviceId) {
      query.where('autonomousService.id = :serviceId', { serviceId });
    }
    if (status) {
      query.where('invitation.status = :status', { status });
    }
    const invitations = await query.getMany();
    return invitations;
  }

  async getInvitationByTutorAndService(tutorId: string, serviceId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { tutor: { id: tutorId }, autonomousService: { id: serviceId } },
      relations: ['autonomousService', 'tutor'],
    });
    if (!invitation) {
      this.exceptionHandler.throwNotFound(
        _404.YOU_ARE_NOT_INVITED_TO_JOIN_THIS_SERVICE,
      );
    }
    return invitation;
  }

  async getInvitationById(invitationId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['autonomousService', 'tutor'],
    });
    if (!invitation) {
      this.exceptionHandler.throwNotFound(
        _404.YOU_ARE_NOT_INVITED_TO_JOIN_THIS_SERVICE,
      );
    }
    return invitation;
  }

  async sendInvitation(invitationId: string) {
    const invitation = await this.getInvitationById(invitationId);
    invitation.status = EInvitationStatus.PENDING;
    return await this.invitationRepository.save(invitation);
  }
  async moveInvitationToPending(dto: UpdateInvitationStageDto) {
    const autonomousService = await this.getAutonomousServiceById(
      dto.autonomousServiceId,
    );
    if (!autonomousService) {
      this.exceptionHandler.throwNotFound(_404.AUTONOMOUS_SERVICE_NOT_FOUND);
    }

    const invitations = await this.invitationRepository.find({
      where: {
        autonomousService: { id: dto.autonomousServiceId },
        tutor: { id: In(dto.tutorIds) },
        status: EInvitationStatus.INITIATED,
      },
      relations: ['tutor'],
    });
    invitations.forEach((invitation) => {
      invitation.status = EInvitationStatus.PENDING;
    });
    return await this.invitationRepository.save(invitations);
  }

  async deleteInvitations(dto: UpdateInvitationStageDto) {
    const autonomousService = await this.getAutonomousServiceById(
      dto.autonomousServiceId,
    );
    if (!autonomousService) {
      this.exceptionHandler.throwNotFound(_404.AUTONOMOUS_SERVICE_NOT_FOUND);
    }

    const invitations = await this.invitationRepository.find({
      where: {
        autonomousService: { id: dto.autonomousServiceId },
        tutor: { id: In(dto.tutorIds) },
        status: EInvitationStatus.INITIATED,
      },
      relations: ['tutor'],
    });
    if (invitations.length === 0) {
      this.exceptionHandler.throwNotFound(_404.INVITATION_NOT_FOUND);
    }
    await this.invitationRepository.delete(invitations.map((inv) => inv.id));
  }
}
