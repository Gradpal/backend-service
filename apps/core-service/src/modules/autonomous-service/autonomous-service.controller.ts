import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AutonomousServiceService } from './autonomous-service.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiProduces,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateAutonomousServiceDto } from './dtos/create-autonomous-service.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SubmitBidDto } from './dtos/submit-bid.dto';
import { SessionReviewDto } from '../class-session/dto/session-review.dto';
import { EAutonomousServiceStatus } from './enums/autonomous-service-status.enum';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { EInvitationStatus } from './enums/invitation-status.enum';
import { UpdateInvitationStageDto } from './dtos/invitation-dto';
import { EBidStatus } from './enums/bid-status.enum';

@Controller('autonomous-service')
@ApiTags('Autonomous Service')
@ApiBearerAuth()
export class AutonomousServiceController {
  constructor(
    private readonly autonomousServiceService: AutonomousServiceService,
  ) {}

  @Post()
  @AuthUser()
  @ApiOperation({ summary: 'Create an autonomous service' })
  @ApiResponse({
    status: 201,
    description: 'The autonomous service has been successfully created.',
  })
  @UseInterceptors(FilesInterceptor('supportingDocuments', 3))
  @ApiBody({ type: CreateAutonomousServiceDto })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable',
  })
  async createAutonomousService(
    @Body() createAutonomousServiceDto: CreateAutonomousServiceDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.autonomousServiceService.createAutonomousService(
      createAutonomousServiceDto,
      req.user as User,
      files,
    );
  }

  @Get()
  @AuthUser()
  @ApiOperation({ summary: 'Get all autonomous services' })
  @ApiResponse({
    status: 200,
    description: 'The autonomous services have been successfully retrieved.',
  })
  @ApiQuery({
    name: 'searchKeyword',
    required: false,
    type: String,
    description: 'Search keyword',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    type: Number,
    description: 'Page',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Status',
  })
  @AuthUser()
  async getAllServices(
    @Query('searchKeyword') searchKeyword: string,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('status') status: EAutonomousServiceStatus,
    @Req() req,
  ) {
    return this.autonomousServiceService.getAllServices(
      searchKeyword,
      status,
      limit,
      page,
      req.user as User,
    );
  }

  @Get(':id')
  @AuthUser()
  @ApiOperation({ summary: 'Get an autonomous service by ID' })
  @ApiResponse({
    status: 200,
    description: 'The autonomous service has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', description: 'Autonomous service ID' })
  async getAutonomousServiceById(@Param('id') id: string) {
    return this.autonomousServiceService.getAutonomousServiceById(id);
  }

  @Post(':serviceId/bid')
  @ApiOperation({ summary: 'Submit a bid for an autonomous service' })
  @ApiResponse({
    status: 201,
    description: 'The bid has been successfully submitted.',
  })
  @ApiParam({ name: 'serviceId', description: 'Autonomous service ID' })
  @ApiBody({ type: SubmitBidDto })
  @AuthUser()
  async submitBid(
    @Param('serviceId') serviceId: string,
    @Body() submitBidDto: SubmitBidDto,
    @Req() req,
  ) {
    return this.autonomousServiceService.submitBid(
      submitBidDto,
      serviceId,
      req.user as User,
    );
  }

  @Post('bid/:bidId/counter-bid')
  @AuthUser()
  @ApiOperation({ summary: 'Submit a counter bid for an autonomous service' })
  @ApiResponse({
    status: 201,
    description: 'The counter bid has been successfully submitted.',
  })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  @ApiBody({ type: SubmitBidDto })
  async submitCounterBid(
    @Param('bidId') bidId: string,
    @Body() submitCounterBidDto: SubmitBidDto,
    @Req() req,
  ) {
    return this.autonomousServiceService.submitCounterBid(
      submitCounterBidDto,
      bidId,
      req.user as User,
    );
  }

  @Patch('bid/:bidId/accept')
  @AuthUser()
  @ApiOperation({ summary: 'Accept a bid for an autonomous service' })
  @ApiResponse({
    status: 200,
    description: 'The bid has been successfully accepted.',
  })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  async acceptBid(@Param('bidId') bidId: string, @Req() req) {
    return this.autonomousServiceService.acceptOrRejectBid(
      bidId,
      EBidStatus.ACCEPTED,
      req.user as User,
    );
  }

  @Patch('bid/:bidId/reject')
  @AuthUser()
  @ApiOperation({ summary: 'Reject a bid for an autonomous service' })
  @ApiResponse({
    status: 200,
    description: 'The bid has been successfully rejected.',
  })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  async rejectBid(@Param('bidId') bidId: string, @Req() req) {
    return this.autonomousServiceService.acceptOrRejectBid(
      bidId,
      EBidStatus.REJECTED,
      req.user as User,
    );
  }

  @Patch(':serviceId/review')
  @AuthUser()
  @ApiOperation({ summary: 'Review an autonomous service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully reviewed.',
  })
  @ApiParam({ name: 'serviceId', description: 'Autonomous service ID' })
  @ApiBody({ type: SessionReviewDto })
  async reviewService(
    @Param('serviceId') serviceId: string,
    @Body() review: SessionReviewDto,
  ) {
    return this.autonomousServiceService.reviewBid(serviceId, review);
  }

  @Post('/tutors/:tutorId/invite')
  @AuthUser()
  @ApiOperation({ summary: 'Invite a tutor for an autonomous service' })
  @ApiResponse({
    status: 201,
    description: 'The invitation has been successfully sent.',
  })
  @ApiParam({ name: 'tutorId', description: 'Tutor ID' })
  @ApiBody({ type: CreateInvitationDto })
  async inviteTutor(
    @Param('tutorId') tutorId: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ) {
    return this.autonomousServiceService.inviteTutor(
      createInvitationDto,
      tutorId,
    );
  }

  @Get('/invitations/all')
  @AuthUser()
  @ApiOperation({ summary: 'Get all invitations' })
  @ApiResponse({
    status: 200,
    description: 'The invitations have been successfully retrieved.',
  })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    type: String,
    description: 'Service ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Status',
  })
  @AuthUser()
  async getInvitations(
    @Query('serviceId') serviceId: string,
    @Query('status') status: EInvitationStatus,
  ) {
    return this.autonomousServiceService.getInvitations(serviceId, status);
  }

  @Patch('/invitations/move-to-pending')
  @ApiOperation({ summary: 'Move initiated invitations to pending stage' })
  @ApiResponse({
    status: 200,
    description: 'Invitations moved to pending successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Autonomous service or invitations not found',
  })
  async moveInvitationToPending(@Body() dto: UpdateInvitationStageDto) {
    return this.autonomousServiceService.moveInvitationToPending(dto);
  }

  @Patch('/invitations/delete')
  @ApiOperation({ summary: 'Delete initiated invitations for tutors' })
  @ApiResponse({ status: 200, description: 'Invitations deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Autonomous service or invitations not found',
  })
  async deleteInitiatedInvitations(@Body() dto: UpdateInvitationStageDto) {
    return this.autonomousServiceService.deleteInvitations(dto);
  }
}
