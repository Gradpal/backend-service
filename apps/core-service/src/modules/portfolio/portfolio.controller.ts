import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Put,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import {
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { EUserRole } from '../user/enums/user-role.enum';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CreateTutorPortfolioDto } from './dto/create-tutor-portfolio.dto';
import { CreateStudentPortfolioDto } from './dto/create-student-portfolio.dto';
import { User } from '../user/entities/user.entity';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { CreateEducationRecordDto } from './dto/create-education-record.dto';
import { UpdateEducationRecordDto } from './dto/update-education-record.dto';
import { UpdatePortfolioProfileDto } from './dto/update-portfolio-profile.dto';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { Portfolio } from './entities/portfolio.entity';
import { UpdatePortfolioAvailabilityDto } from './dto/update-portfolio-availability.dto';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import { WeeklyScheduleDto } from '../user/dto/schedule-slot.dto';
import { Booking } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { SessionInvitationDto } from '../user/dto/session-invitation.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { PreAuthorize } from '@core-service/decorators/auth.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  findAll() {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(id);
  }

  @Post(':id/education')
  addEducationRecord(
    @Param('id') id: string,
    @Body() createEducationRecordDto: CreateEducationRecordDto,
  ) {
    return this.portfolioService.addEducationRecord(
      id,
      createEducationRecordDto,
    );
  }

  @Patch(':id/education/:educationId')
  updateEducationRecord(
    @Param('id') id: string,
    @Param('educationId') educationId: string,
    @Body() updateEducationRecordDto: UpdateEducationRecordDto,
  ) {
    return this.portfolioService.updateEducationRecord(
      id,
      educationId,
      updateEducationRecordDto,
    );
  }

  @Delete(':id/education/:educationId')
  removeEducationRecord(
    @Param('id') id: string,
    @Param('educationId') educationId: string,
  ) {
    return this.portfolioService.removeEducationRecord(id, educationId);
  }

  @Put(':id/profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update portfolio profile' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: Portfolio })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  async updatePortfolioProfile(
    @Param('id') id: string,
    @Body() updatePortfolioProfileDto: UpdatePortfolioProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.portfolioService.updatePortfolioProfile(
      id,
      updatePortfolioProfileDto,
      files,
    );
  }

  @Put(':id/availability')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update portfolio availability' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: Portfolio })
  async updatePortfolioAvailability(
    @Param('id') id: string,
    @Body() updatePortfolioAvailabilityDto: UpdatePortfolioAvailabilityDto,
  ) {
    return this.portfolioService.updatePortfolioAvailability(
      id,
      updatePortfolioAvailabilityDto,
    );
  }

  @Get(':id/tutor/profile')
  @Public()
  @ApiOperation({ summary: 'Get tutor profile' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: TutorProfileDto })
  getTutorProfile(@Param('id') id: string): Promise<TutorProfileDto> {
    return this.portfolioService.getTutorProfile(id);
  }

  @Get(':id/tutor/schedule')
  @Public()
  @ApiOperation({ summary: 'Get tutor weekly schedule' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for the schedule (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, type: WeeklyScheduleDto })
  getTutorSchedule(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
  ): Promise<WeeklyScheduleDto> {
    return this.portfolioService.getTutorSchedule(id, startDate);
  }

  @Get(':id/sessions/upcoming')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get upcoming sessions' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: [Booking] })
  getUpcomingSessions(@Param('id') id: string): Promise<Booking[]> {
    return this.portfolioService.getUpcomingSessions(id);
  }

  @Get(':id/sessions/:sessionId')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: SessionDetailsDto })
  getSessionDetails(
    @Param('sessionId') sessionId: string,
  ): Promise<SessionDetailsDto> {
    return this.portfolioService.getSessionDetails(sessionId);
  }

  @Get(':id/tutor/invitations')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session invitations for the tutor' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: [SessionInvitationDto] })
  getSessionInvitations(
    @Param('id') id: string,
  ): Promise<SessionInvitationDto[]> {
    return this.portfolioService.getSessionInvitations(id);
  }
}
