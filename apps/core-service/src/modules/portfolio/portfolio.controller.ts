import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Put,
  Query,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import {
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EUserRole } from '../user/enums/user-role.enum';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
import { UserService } from '../user/user.service';
import { ETierCategory } from '../subjects/subject-tier/enums/tier-category.enum';
import { User } from '../user/entities/user.entity';

@Controller('portfolio')
@ApiBearerAuth()
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly userService: UserService,
  ) {}

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

  @Post(':id/availability')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update portfolio availability' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: Portfolio })
  async updatePortfolioAvailability(
    @Param('id') id: string,
    @Body() updatePortfolioAvailabilityDto: UpdatePortfolioAvailabilityDto,
  ) {
    console.log(updatePortfolioAvailabilityDto);
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

  @Get('/all/search-tutors')
  @Public()
  @ApiQuery({
    name: 'subject',
    required: false,
    type: String,
    description: 'Subject to search for',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language to search for',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    type: String,
    description: 'Country to search for',
  })
  @ApiQuery({
    name: 'priceMin',
    required: false,
    type: Number,
    description: 'Minimum price to search for',
  })
  @ApiQuery({
    name: 'priceMax',
    required: false,
    type: Number,
    description: 'Maximum price to search for',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name to search for',
  })
  @ApiQuery({
    name: 'degree',
    required: false,
    type: String,
    description: 'Degree to search for',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    type: String,
    description: 'School to search for',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Category to search for',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    type: String,
    description: 'Gender to search for',
  })
  @ApiQuery({
    name: 'religion',
    required: false,
    type: String,
    description: 'Religion to search for',
  })
  @ApiQuery({
    name: 'nationality',
    required: false,
    type: String,
    description: 'Nationality to search for',
  })
  @ApiQuery({
    name: 'dates',
    required: false,
    type: String,
    description: 'Dates to search for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    type: Number,
    description: 'Page number to search for',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 10,
    type: Number,
    description: 'Limit number of results to search for',
  })
  async searchTutors(
    @Query('subject') subject?: string,
    @Query('language') language?: string,
    @Query('country') country?: string,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('name') name?: string,
    @Query('degree') degree?: string,
    @Query('school') school?: string,
    @Query('category') category?: string,
    @Query('gender') gender?: string,
    @Query('religion') religion?: string,
    @Query('nationality') nationality?: string,
    @Query('dates') dates?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.portfolioService.advancedSearchTutors({
      subject,
      language,
      country,
      priceMin,
      priceMax,
      name,
      degree,
      school,
      category,
      gender,
      religion,
      nationality,
      dates,
      page,
      limit,
    });
  }

  @Get(':id/subject-tier')
  @Public()
  @ApiOperation({ summary: 'Get subject tier for a portfolio' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiQuery({ name: 'subject', required: true, type: String })
  @ApiResponse({ status: 200, type: String })
  getSubjectTier(@Param('id') id: string, @Query('subject') subject: string) {
    return this.portfolioService.getSubjectTier(id, subject);
  }
}
