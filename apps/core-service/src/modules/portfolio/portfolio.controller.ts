import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  Param,
  UseGuards,
  Put,
  Query,
  UploadedFiles,
  UploadedFile,
  Req,
  Patch,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import {
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { EUserRole } from '../user/enums/user-role.enum';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  UpdatePersonalStatementDto,
  UpdatePortfolioProfileDto,
  UpdateIntroductoryVideoDto,
  UpdateSubjectsOfInterestDto,
} from './dto/update-portfolio-profile.dto';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { Portfolio } from './entities/portfolio.entity';
import { UpdatePortfolioAvailabilityDto } from './dto/update-portfolio-availability.dto';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import { WeeklyScheduleDto } from '../user/dto/schedule-slot.dto';
import { Booking } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { SessionInvitationDto } from '../user/dto/session-invitation.dto';
import { Public } from '@app/common/decorators/public.decorator';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { UserService } from '../user/user.service';
import { CreateEducationInstitutionRecordDto } from './dto/create-education-record.dto';
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

  @Post(':portfolioId/add-education-institution')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('certificate'))
  addEducationInstitutionRecord(
    @Param('portfolioId') portfolioId: string,
    @UploadedFile() certificate: Express.Multer.File,
    @Body()
    createEducationInstitutionRecordDto: CreateEducationInstitutionRecordDto,
  ) {
    return this.portfolioService.addEducationInstitution(
      portfolioId,
      createEducationInstitutionRecordDto,
      certificate,
    );
  }

  @Put(':portfolioId/personal-statement')
  @AuthUser()
  updatePersonalStatement(
    @Param('portfolioId') portfolioId: string,
    @Body() updatePersonalStatementDto: UpdatePersonalStatementDto,
    @Req() req,
  ) {
    console.log('User tot valudate 2', req.user);
    return this.portfolioService.updatePersonalStatement(
      portfolioId,
      updatePersonalStatementDto,
      req.user as User,
    );
  }

  @Put(':portfolioId/main/introductory-video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('introductoryVideo'))
  @AuthUser()
  updateIntroductoryVideo(
    @Param('portfolioId') portfolioId: string,
    @Body() updateIntroductoryVideoDto: UpdateIntroductoryVideoDto,
    @UploadedFile() introductoryVideo: Express.Multer.File,
    @Req() req,
  ) {
    return this.portfolioService.updateIntroductoryVideo(
      portfolioId,
      updateIntroductoryVideoDto,
      req.user as User,
      introductoryVideo,
    );
  }

  @Patch(':portfolioId/add-subjects-of-interest')
  @AuthUser()
  addSubjectsOfInterest(
    @Param('portfolioId') portfolioId: string,
    @Body() addSubjectsOfInterestDto: UpdateSubjectsOfInterestDto,
    @Req() req,
  ) {
    return this.portfolioService.addSubjectsOfInterest(
      portfolioId,
      addSubjectsOfInterestDto,
      req.user as User,
    );
  }

  // @Patch(':id/education/:educationId')
  // updateEducationRecord(
  //   @Param('id') id: string,
  //   @Param('educationId') educationId: string,
  //   @Body() updateEducationRecordDto: UpdateEducationRecordDto,
  // ) {
  //   return this.portfolioService.updateEducationRecord(
  //     id,
  //     educationId,
  //     updateEducationRecordDto,
  //   );
  // }

  // @Delete(':id/education/:educationId')
  // removeEducationRecord(
  //   @Param('id') id: string,
  //   @Param('educationId') educationId: string,
  // ) {
  //   return this.portfolioService.removeEducationRecord(id, educationId);
  // }

  @Put(':id/profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update portfolio profile' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, type: Portfolio })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'introductoryVideos', maxCount: 1 },
      { name: 'academicTranscripts', maxCount: 10 },
      { name: 'degreeCertificates', maxCount: 10 },
    ]),
  )
  @ApiBody({
    type: UpdatePortfolioProfileDto,
    description: 'Update portfolio profile',
  })
  async updatePortfolioProfile(
    @Param('id') id: string,
    @Body() updatePortfolioProfileDto: UpdatePortfolioProfileDto,
    @UploadedFiles()
    files: {
      introductoryVideos?: Express.Multer.File[];
      academicTranscripts?: Express.Multer.File[];
      degreeCertificates?: Express.Multer.File[];
    },
  ) {
    return this.portfolioService.updatePortfolioProfile(
      id,
      updatePortfolioProfileDto,
      files.introductoryVideos,
      files.academicTranscripts,
      files.degreeCertificates,
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
    name: 'subjectId',
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
    @Query('subjectId') subjectId?: string,
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
      subjectId,
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
