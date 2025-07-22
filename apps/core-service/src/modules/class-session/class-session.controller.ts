import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { ClassSession } from './entities/class-session.entity';
import { ESessionStatus } from './enums/session-status.enum';
import { User } from '../user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ATTACHMENT_MAX_COUNT,
  ATTACHMENT_MAX_SIZE,
} from '@core-service/common/constants/all.constants';
import { CancelLessonDto } from './dto/cancel-lesson.dto';
import { RequestSessionExtensionDto } from './dto/request-extion.dto';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { SessionReviewDto } from './dto/session-review.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { SessionDashboardDataDTO } from './dto/session-dashboard-data.dto';
import { TimeRangeDTO } from '@core-service/common/dtos/all.dto';

@ApiTags('Class Sessions')
@Controller('class-session')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class session' })
  @ApiResponse({ status: 201, type: ClassSession })
  @ApiConsumes('multipart/form-data')
  @AuthUser()
  @UseInterceptors(
    FileInterceptor('supportingDocuments', {
      limits: {
        fileSize: ATTACHMENT_MAX_SIZE,
        files: ATTACHMENT_MAX_COUNT,
      },
    }),
  )
  @Get('all/mine')
  @ApiOperation({ summary: 'Get all class sessions' })
  @ApiQuery({ name: 'status', type: 'string', required: false })
  @ApiQuery({ name: 'searchKeyword', required: false })
  @ApiQuery({ name: 'page', default: 1, required: false })
  @ApiQuery({ name: 'limit', default: 10, required: false })
  @AuthUser()
  findSessionsForLoggedInUser(
    @Query('status') status: string,
    @Query('searchKeyword') searchKeyword: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req,
  ) {
    return this.classSessionService.findSessionsForLoggedInUser(
      status,
      searchKeyword,
      req.user as User,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class session by ID' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  findOne(@Param('id') id: string) {
    return this.classSessionService.findOne(id);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.classSessionService.remove(id);
  }

  @Get('tutor/:tutorId')
  @ApiOperation({ summary: 'Get all class sessions for a tutor' })
  @ApiParam({ name: 'tutorId', description: 'Tutor ID' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  findByTutor(@Param('tutorId') tutorId: string) {
    return this.classSessionService.findByTutor(tutorId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all class sessions for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  findByStudent(@Param('studentId') studentId: string) {
    return this.classSessionService.findByStudent(studentId);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get all class sessions for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  @AuthUser()
  @ApiResponse({
    status: 200,
    description: 'Get all class sessions for a child',
    type: [ClassSession],
  })
  @PreAuthorize(EUserRole.PARENT)
  findByChild(@Param('childId') childId: string, @Req() req) {
    return this.classSessionService.findByChild(childId, req.user as User);
  }
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update class session status' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiQuery({ name: 'status', enum: ESessionStatus })
  @ApiResponse({ status: 200, type: ClassSession })
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: ESessionStatus,
  ) {
    return this.classSessionService.updateStatus(id, status);
  }

  @Post(':id/join')
  @AuthUser()
  @ApiOperation({ summary: 'Join a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  joinSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.joinSession(id, req.user as User);
  }

  @Post(':id/leave')
  @AuthUser()
  @ApiOperation({ summary: 'Leave a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  leaveSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.leaveSession(id, req.user as User);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @AuthUser()
  @ApiResponse({ status: 200, type: ClassSession })
  acceptSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.acceptSession(id, req.user as User);
  }

  @Post(':id/postpone')
  @AuthUser()
  @ApiOperation({ summary: 'Postpone a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  postponeSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.postponeSession(id, req.user as User);
  }

  @Post(':id/cancel')
  @AuthUser()
  @ApiOperation({ summary: 'Cancel a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  cancelSession(
    @Param('id') id: string,
    @Req() req,
    @Body() cancelLessonDto: CancelLessonDto,
  ) {
    return this.classSessionService.cancelSession(
      id,
      req.user as User,
      cancelLessonDto,
    );
  }

  @Post(':id/request-extension')
  @ApiOperation({ summary: 'Request a session extension' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  requestSessionExtension(
    @Param('id') id: string,
    @Req() req,
    @Body() requestSessionExtensionDto: RequestSessionExtensionDto,
  ) {
    return this.classSessionService.requestSessionExtension(
      id,
      req.user as User,
      requestSessionExtensionDto,
    );
  }

  @Post(':id/accept-reject-extension')
  @ApiOperation({ summary: 'Accept or reject a session extension' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  acceptOrRejectSessionExtension(
    @Param('id') id: string,
    @Req() req,
    @Body('accept') accept: boolean,
  ) {
    return this.classSessionService.acceptOrRejectSessionExtension(
      id,
      req.user as User,
      accept,
    );
  }

  @Get('all/upcoming')
  @ApiOperation({ summary: 'Get top upcoming sessions for a student' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  getTopUpcomingSessions(@Req() req) {
    return this.classSessionService.getTopUpcomingSessions(req.user as User);
  }

  @Get('validate-meeting-link/:sessionId/:meetId')
  @Public()
  @ApiOperation({ summary: 'Validate a meeting link' })
  @ApiParam({ name: 'sessionId', description: 'Class session ID' })
  @ApiParam({ name: 'meetId', description: 'Meeting ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  validateMeetingLink(
    @Param('sessionId') sessionId: string,
    @Param('meetId') meetId: string,
  ) {
    return this.classSessionService.validateMeetingLink(sessionId, meetId);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Review a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  reviewSession(
    @Param('id') id: string,
    @Req() req,
    @Body() reviewSessionDto: SessionReviewDto,
  ) {
    return this.classSessionService.reviewSession(
      id,
      req.user as User,
      reviewSessionDto,
    );
  }

  @Get('/child/statistics/:childId')
  @AuthUser()
  @ApiOperation({ summary: 'Get sessions statistics for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiExtraModels(TimeRangeDTO)
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Get  sessions statics for a child',
    type: SessionDashboardDataDTO,
  })
  getStaticsChildSession(
    @Param('childId') childId: string,
    @Query() timeRange: TimeRangeDTO,
  ) {
    return this.classSessionService.getSessionDashboardData(childId, timeRange);
  }
}
