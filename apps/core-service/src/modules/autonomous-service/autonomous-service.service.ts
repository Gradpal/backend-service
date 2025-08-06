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
import { SessionReviewDto } from '../session-package/class-session/dto/session-review.dto';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { UserService } from '../user/user.service';
import { EInvitationStatus } from './enums/invitation-status.enum';
import { Invitation } from './entities/invitation.entity';
import { UpdateInvitationStageDto } from './dtos/invitation-dto';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';
import { PlatformQueuePayload } from '@app/common/interfaces/shared-queues/platform-queue-payload.interface';
import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';

@Injectable()
export class AutonomousServiceService {
  constructor(
    @InjectRepository(AutonomousService)
    private autonomousServiceRepository: Repository<AutonomousService>,
    @InjectRepository(Bid) private bidRepository: Repository<Bid>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private readonly minioClientService: MinioClientService,
    private readonly subjectService: SubjectsService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly userService: UserService,
    private readonly notificationProcessor: NotificationPreProcessor,
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

    const service =
      await this.autonomousServiceRepository.save(autonomousService);
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.AUTONOMOUS_SERVICE_CREATION,
      [loggedInUser.email],
      {
        studentName: loggedInUser.firstName,
        serviceTitle: createAutonomousServiceDto.projectTitle,
        description: createAutonomousServiceDto.description,
        date: new Date().toLocaleString(),
      },
    );

    await this.notifyOnPlatform({
      messageType: ENotificationMessageType.AUTONOMOUS_SERVICE_CREATION,
      recipients: [{ userId: loggedInUser.id }],
      subject: 'autonomous service created',
      metadata: {
        content: {
          title: 'autonomous service created ',
          description:
            'your service draft has been created . add teacher to invite',
          subTitle: 'service created',
          body: createAutonomousServiceDto.projectTitle,
        },
        callToAction: {
          id: autonomousService.id,
        },
      },
    });
    return service;
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
      'bids.user',
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
      relations: ['autonomousService', 'autonomousService.student'],
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
    // student notifications
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.BID_RECEIVED,
      [loggedInUser.email],
      {
        firstName: loggedInUser.firstName,
        serviceTitle: autonomousService.projectTitle,
        date: new Date(),
        teacherName: bid.user.firstName,
      },
    );
    await this.notifyOnPlatform({
      messageType: ENotificationMessageType.BID_SUBMITTED,
      recipients: [{ userId: autonomousService.student.id }],
      subject: 'Service Bid update',
      metadata: {
        content: {
          title: 'Service Bid update',
          description: `${loggedInUser.email} has submitted a bid for your service `,
          body: `${loggedInUser.email} has submitted a bid for your service `,
          subTitle: 'Service Bid update',
        },
        callToAction: {
          id: autonomousService.id,
        },
      },
    });
    // tutor notification
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.BID_SUBMITTED,
      [loggedInUser.email],
      {
        firstName: loggedInUser.firstName,
        serviceTitle: autonomousService.projectTitle,
        studentName: autonomousService.student.firstName,
        date: new Date(),
      },
    );

    await this.notifyOnPlatform({
      messageType: ENotificationMessageType.BID_SUBMITTED,
      recipients: [{ userId: bid.user.id }],
      subject: 'Service Bid update',
      metadata: {
        content: {
          title: 'Service Bid update',
          description: `You have successfully submitted your bid for ${autonomousService.student.firstName} on service ${autonomousService.projectTitle} `,
          body: `You have successfully submitted your bid for ${autonomousService.student.firstName} on service ${autonomousService.projectTitle} `,
          subTitle: 'Service Bid update',
        },
        callToAction: {
          id: autonomousService.id,
        },
      },
    });
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
    const updatedBid = await this.bidRepository.save(bid);
    if (loggedInUser.role == EUserRole.TUTOR) {
      // tutor notifications
      await this.notifyOnPlatform({
        messageType: ENotificationMessageType.COUNTER_BID_SUBMITTED,
        recipients: [{ userId: loggedInUser.id }],
        subject: 'Service Bid update',
        metadata: {
          content: {
            title: 'Service Bid update',
            description: ` you have received counterbid from  ${bid.autonomousService.student.email}   `,
            body: ` you have received counterbid from  ${bid.autonomousService.student.email}   `,
            subTitle: 'Service Bid update',
          },
          callToAction: {
            id: bid.autonomousService.id,
          },
        },
      });

      await this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.COUNTER_BID_SUBMITTED,
        [loggedInUser.email],
        {
          firstName: loggedInUser.firstName,
          studentName: bid.autonomousService.student.firstName,
          serviceTitle: bid.autonomousService.projectTitle,
          date: new Date(),
        },
      );
    } else {
      await this.notifyOnPlatform({
        messageType: ENotificationMessageType.COUNTER_BID_SUBMITTED,
        recipients: [{ userId: loggedInUser.id }],
        subject: 'Service Bid update',
        metadata: {
          content: {
            title: 'Service Bid update',
            description: ` you have sent counterbid to  ${bid.user.email}  `,
            body: ` you have sent counterbid to  ${bid.user.email}  `,
            subTitle: 'Service Bid update',
          },
          callToAction: {
            id: bid.id,
          },
        },
      });
    }
    return updatedBid;
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

    if (action == EBidStatus.ACCEPTED) {
      if (user.role == EUserRole.STUDENT) {
        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.ACCEPT_BID_STUDENT,
          [user.email],
          {
            firstName: user.firstName,
            serviceTitle: bid.autonomousService.projectTitle,
            teacherName: bid.user.firstName,
            date: new Date(),
          },
        );
        // notify tutor that his bid is accepted
        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.BID_ACCEPTED,
          [bid.user.email],
          {
            firstName: bid.user.firstName,
            serviceTitle: bid.autonomousService.projectTitle,
            studentName: bid.autonomousService.student.firstName,
            date: new Date(),
          },
        );
        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.BID_REJECTED,
          [bid.user.email],
          {
            firstName: bid.user.firstName,
            serviceTitle: bid.autonomousService.projectTitle,
            studentName: bid.autonomousService.student.firstName,
            date: new Date(),
          },
        );
        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.BID_ACCEPTED,
          recipients: [{ userId: user.id }],
          subject: 'Service Bid update',
          metadata: {
            content: {
              title: 'Service Bid update',
              description: ` you have accepted ${bid.user.email}'s bid   `,
              body: ` you have accepted ${bid.user.email}'s bid   `,
              subTitle: 'Service Bid update',
            },
            callToAction: {
              id: bid.autonomousService.id,
            },
          },
        });
      }

      // tutor notification
      await this.notifyOnPlatform({
        messageType: ENotificationMessageType.BID_ACCEPTED,
        recipients: [{ userId: user.id }],
        subject: 'Service Bid update',
        metadata: {
          content: {
            title: 'Service Bid update',
            description: ` your bid for  ${bid.autonomousService.student.firstName}'s ${bid.autonomousService}  has been  accepted   `,
            body: ` your bid for  ${bid.autonomousService.student.firstName}'s ${bid.autonomousService}  has been  accepted   `,
            subTitle: 'Service Bid update',
          },
          callToAction: {
            id: bid.autonomousService.id,
          },
        },
      });
    } else {
      if (user.role == EUserRole.STUDENT) {
        //  student notification
        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.REJECT_BID_STUDENT,
          [user.email],
          {
            firstName: user.firstName,
            serviceTitle: bid.autonomousService.projectTitle,
            teacherName: bid.user.firstName,
            date: new Date(),
          },
        );
        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.BID_REJECTED,
          recipients: [{ userId: user.id }],
          subject: 'Service Bid update',
          metadata: {
            content: {
              title: 'Service Bid update',
              description: ` you have rejected ${bid.user.email}'s bid   `,
              body: ` you have rejected ${bid.user.email}'s bid   `,
              subTitle: 'Service Bid update',
            },
            callToAction: {
              id: bid.autonomousService.id,
            },
          },
        });
      } else {
        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.BID_REJECTED,
          recipients: [{ userId: user.id }],
          subject: 'Service Bid update',
          metadata: {
            content: {
              title: 'Service Bid update',
              description: ` your bid for  ${bid.autonomousService.student.firstName}'s ${bid.autonomousService}  has been  rejected   `,
              body: ` your bid for  ${bid.autonomousService.student.firstName}'s ${bid.autonomousService}  has been  rejected    `,
              subTitle: 'Service Bid update',
            },
            callToAction: {
              id: bid.autonomousService.id,
            },
          },
        });
      }
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

  async reviewBid(serviceId: string, review: SessionReviewDto, user: User) {
    const service = await this.getAutonomousServiceById(serviceId);
    service.review = review;
    service.status = EAutonomousServiceStatus.COMPLETED;
    const updatedService = await this.autonomousServiceRepository.save(service);
    // student  notification
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.REVIEW,
      [user.email],
      {
        firstName: user.firstName,
        serviceTitle: service.projectTitle,
        date: new Date(),
      },
    );
    await this.notifyOnPlatform({
      messageType: ENotificationMessageType.COUNTER_BID_SUBMITTED,
      recipients: [{ userId: service.student.id }],
      subject: 'Service Progress update',
      metadata: {
        content: {
          title: 'Service Progress update',
          description: `  you marked the service ${service.projectTitle} as completed `,
          body: `  you marked the service ${service.projectTitle} as completed `,
          subTitle: 'Service progress update',
        },
        callToAction: {
          id: service.id,
        },
      },
    });
    return updatedService;
  }

  async inviteTutor(createInvitationDto: CreateInvitationDto, tutorId: string) {
    const tutor = await this.userService.findOne(tutorId);
    const services = await this.autonomousServiceRepository.find({
      where: { id: In(createInvitationDto.serviceIds) },
      relations: ['student', 'subject'],
    });

    for (const service of services) {
      const invitation = this.invitationRepository.create({
        autonomousService: service,
        status: createInvitationDto.inviteDirectly
          ? EInvitationStatus.PENDING
          : EInvitationStatus.INITIATED,
        tutor,
      });
      await this.invitationRepository.save(invitation);

      if (createInvitationDto.inviteDirectly) {
        // show platform  & email notification to student
        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.INVITATION_CREATION,
          [service.student.email],
          {
            teacherName: tutor.email,
            serviceTitle: service.projectTitle,
            subject: service.subject.name,
          },
        );
        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.INVITATION_CREATION,
          recipients: [{ userId: service.student.id }],
          subject: 'invitation creation ',
          metadata: {
            content: {
              title: 'invitation created',
              description: `you have added   ${tutor.firstName} ${tutor.lastName}  to your invitation list and sent invitation for service ${service.projectTitle} `,
              subTitle: 'invitation created and sent',
              body: `"invitation  for ${service.projectTitle} has been created and sent to tutor  ${tutor.firstName} ${tutor.lastName}`,
            },
            callToAction: {
              id: invitation.id,
            },
          },
        });

        // teacher email and platform notification

        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.INVITATION_SENT,
          [tutor.id],
          {
            teacherName: tutor.firstName,
            serviceTitle: service.projectTitle,
            subject: service.subject.name,
          },
        );

        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.INVITATION_SENT,
          recipients: [{ userId: tutor.id }],
          subject: 'Service Update',
          metadata: {
            content: {
              title: 'Service Update',
              description: `you have received an invitation to bid on new   ${service.subject.name} from ${service.student.firstName} ${service.student.lastName}  `,
              body: `you have received an invitation to bid on new   ${service.subject.name} from ${service.student.firstName} ${service.student.lastName}  `,
              subTitle: 'Service Update',
            },
            callToAction: {
              id: service.id,
            },
          },
        });
      } else {
        await this.notifyOnPlatform({
          messageType: ENotificationMessageType.INVITATION_CREATION,
          recipients: [{ userId: service.student.id }],
          subject: 'Service invitation update ',
          metadata: {
            content: {
              title: 'Service invitation update ',
              description: `you have  added    ${tutor.firstName} ${tutor.lastName}  to your invitation list`,
              body: `"invitation  for ${service.projectTitle} has been created `,
            },
            callToAction: {
              id: invitation.id,
            },
          },
        });
      }
    }
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
      relations: [
        'tutor',
        'autonomousService',
        'autonomousService.subject',
        'autonomousService.student',
      ],
    });
    invitations.forEach((invitation) => {
      invitation.status = EInvitationStatus.PENDING;
    });

    await this.invitationRepository.save(invitations);
    invitations.forEach(async (invitation) => {
      await this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.INVITATION_SENT,
        [invitation.autonomousService.student.email],
        {
          teacherName: invitation.tutor.email,
          serviceTitle: invitation.autonomousService.projectTitle,
          subject: invitation.autonomousService.subject.name,
        },
      );
      await this.notifyOnPlatform({
        messageType: ENotificationMessageType.INVITATION_SENT,
        recipients: [{ userId: invitation.autonomousService.student.id }],
        subject: 'invitation sent ',
        metadata: {
          content: {
            title: 'invitation sent',
            description: `invitation sent to    ${invitation.tutor.firstName} ${invitation.tutor.lastName}  `,
            subTitle: 'invitation sent',
            body: `invitation sent to    ${invitation.tutor.firstName} ${invitation.tutor.lastName}  `,
          },
          callToAction: {
            id: invitation.id,
          },
        },
      });
    });
    return invitations;
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
      relations: [
        'tutor',
        'autonomousService',
        'autonomousService.subject',
        'autonomousService.student',
      ],
    });
    if (invitations.length === 0) {
      this.exceptionHandler.throwNotFound(_404.INVITATION_NOT_FOUND);
    }

    await this.invitationRepository.delete(invitations.map((inv) => inv.id));
    invitations.forEach(async (invitation) => {
      await this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.INVITATION_DELETED,
        [invitation.autonomousService.student.email],
        {
          teacherName: invitation.tutor.email,
          serviceTitle: invitation.autonomousService.projectTitle,
          subject: invitation.autonomousService.subject.name,
        },
      );
      await this.notifyOnPlatform({
        messageType: ENotificationMessageType.INVITATION_DELETED,
        recipients: [{ userId: invitation.autonomousService.student.id }],
        subject: 'invitation deleted ',
        metadata: {
          content: {
            title: 'invitation deleted',
            description: `    ${invitation.tutor.firstName} ${invitation.tutor.lastName} has been removed from your invitation list   `,
            subTitle: 'invitation deleted',
            body: `    ${invitation.tutor.firstName} ${invitation.tutor.lastName} has been removed from your invitation list   `,
          },
          callToAction: {
            id: invitation.autonomousService.id,
          },
        },
      });
    });
  }

  async notifyOnPlatform(data: PlatformQueuePayload) {
    return await this.notificationProcessor.sendPlatformNotification(data);
  }
}
