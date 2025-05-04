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
  UploadedFiles,
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  @ApiBody({ type: CreateClassSessionDto })
  @UseInterceptors(
    FileInterceptor('supportingDocuments', {
      limits: {
        fileSize: ATTACHMENT_MAX_SIZE,
        files: ATTACHMENT_MAX_COUNT,
      },
    }),
  )
  create(
    @Body() createClassSessionDto: CreateClassSessionDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.classSessionService.create(
      req.user as User,
      createClassSessionDto,
      files,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all class sessions' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  findAll() {
    return this.classSessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class session by ID' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  findOne(@Param('id') id: string) {
    return this.classSessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  update(
    @Param('id') id: string,
    @Body() updateClassSessionDto: Partial<CreateClassSessionDto>,
    @Req() req,
  ) {
    return this.classSessionService.update(
      req.user as User,
      id,
      updateClassSessionDto,
    );
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
  @ApiOperation({ summary: 'Join a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  joinSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.joinSession(id, req.user as User);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  leaveSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.leaveSession(id, req.user as User);
  }

  @Post(':id/postpone')
  @ApiOperation({ summary: 'Postpone a class session' })
  @ApiParam({ name: 'id', description: 'Class session ID' })
  @ApiResponse({ status: 200, type: ClassSession })
  postponeSession(@Param('id') id: string, @Req() req) {
    return this.classSessionService.postponeSession(id, req.user as User);
  }

  @Post(':id/cancel')
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

  @Get('student/:studentId/upcoming')
  @ApiOperation({ summary: 'Get top upcoming sessions for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, type: [ClassSession] })
  getTopUpcomingSessions(@Param('studentId') studentId: string, @Req() req) {
    return this.classSessionService.getTopUpcomingSessions(req.user as User);
  }
}
