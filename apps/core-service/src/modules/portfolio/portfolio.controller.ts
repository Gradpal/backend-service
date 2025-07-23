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
  Delete,
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
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  UpdatePersonalStatementDto,
  UpdatePortfolioProfileDto,
  UpdateIntroductoryVideoDto,
  UpdateSubjectsOfInterestDto,
  UpdatePersonalInfoDto,
  UpdateAcademicDto,
} from './dto/update-portfolio-profile.dto';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { Portfolio } from './entities/portfolio.entity';
import { UpdatePortfolioAvailabilityDto } from './dto/update-portfolio-availability.dto';
import { TutorProfileDto } from './dto/tutor-profile.dto';
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
import { AddSessionLengthDto } from './dto/create-portfolio.dto';
import { AddSessionTypeOfferingDto } from './dto/add-session-type-offering.dto';
import { UpdateSessionLengthDto } from './dto/Update-session-length.dto';
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
  @Delete(
    ':portfolioId/remove-subject-from-subjects-of-interest-and-tiers/:subjectId',
  )
  removeSubjectFromSubjectsOfInterestAndTiers(
    @Param('portfolioId') portfolioId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.portfolioService.removeSubjectFromSubjectsOfInterestAndTiers(
      portfolioId,
      subjectId,
    );
  }

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

  @Post(':id/update-availability')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update portfolio availability' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @AuthUser()
  @ApiResponse({ status: 200, type: Portfolio })
  async updatePortfolioAvailability(
    @Param('id') id: string,
    @Body() updatePortfolioAvailabilityDto: UpdatePortfolioAvailabilityDto,
    @Req() req,
  ) {
    return this.portfolioService.updatePortfolioAvailability(
      req.user as User,
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
    //
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

  @Post('save-tutor/:tutorId')
  @ApiOperation({ summary: 'Save tutor' })
  @ApiParam({ name: 'tutorId', description: 'Tutor ID' })
  @ApiResponse({ status: 200, type: Portfolio })
  @AuthUser()
  saveTutor(@Param('tutorId') tutorId: string, @Req() req) {
    return this.portfolioService.saveTutor(req.user as User, tutorId);
  }

  @Get(':portfolioId')
  getPortfolioById(@Param('portfolioId') portfolioId: string) {
    return this.portfolioService.getPortfolioById(portfolioId);
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

  @Post(':portfolioId/add-session-length')
  addSessionLength(
    @Param('portfolioId') portfolioId: string,
    @Body() addSessionLengthDto: AddSessionLengthDto,
  ) {
    return this.portfolioService.addSessionLength(
      portfolioId,
      addSessionLengthDto,
    );
  }

  @Delete(':portfolioId/remove-session-length')
  removeSessionLength(
    @Param('portfolioId') portfolioId: string,
    @Body() removeSessionLengthDto: AddSessionLengthDto,
  ) {
    return this.portfolioService.removeSessionLength(
      portfolioId,
      removeSessionLengthDto,
    );
  }

  @Post(':portfolioId/add-session-package-offering')
  @AuthUser()
  async addSessionPackageOffering(
    @Param('portfolioId') portfolioId: string,
    @Body() addSessionPackageOfferingDto: AddSessionTypeOfferingDto,
  ) {
    return this.portfolioService.addSessionPackageOffering(
      portfolioId,
      addSessionPackageOfferingDto,
    );
  }

  @Delete(':portfolioId/remove-session-package-offering/:sessionPackageTypeId')
  removeSessionPackageOffering(
    @Param('portfolioId') portfolioId: string,
    @Param('sessionPackageTypeId') sessionPackageTypeId: string,
  ) {
    return this.portfolioService.removeSessionPackageOffering(
      portfolioId,
      sessionPackageTypeId,
    );
  }
  @Patch('/profile/personal-info')
  @AuthUser()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update personal information' })
  @ApiResponse({ status: 200, type: Portfolio })
  async updatePersonalInfo(
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
    @Req() req,
  ) {
    return this.portfolioService.updatePersonalInfo(
      updatePersonalInfoDto,
      req.user as User,
    );
  }

  @Patch('/profile/session-length')
  @AuthUser()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update  session Length' })
  @ApiResponse({ status: 200, type: Portfolio })
  async updateSessionLength(@Body() dto: UpdateSessionLengthDto, @Req() req) {
    return this.portfolioService.updateSessionLength(dto, req.user as User);
  }
  @Get('/profile/calendar/get-linked-calendar')
  @AuthUser()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'get  linked calendars' })
  @ApiResponse({ status: 200, type: Portfolio })
  async getLinkedCalendars(@Body() dto: UpdateSessionLengthDto, @Req() req) {
    return this.portfolioService.getLinkedCalendars(dto, req.user as User);
  }

  @Patch('/profile/academic-info')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @AuthUser()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update academic information' })
  @ApiResponse({ status: 200, type: Portfolio })
  @ApiBody({
    description:
      'Update academic info with multiple institutions and file uploads',
    schema: {
      type: 'object',
      properties: {
        institutions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Harvard University' },
              degreeType: { type: 'string', example: 'Bachelor' },
              yearStarted: { type: 'number', example: 2018 },
              yearEnded: { type: 'number', example: 2022 },
              academicTranscript: {
                type: 'string',
                format: 'binary',
                nullable: true,
              },
              degreeCertificate: {
                type: 'string',
                format: 'binary',
                nullable: true,
              },
            },
          },
        },
        personalStatement: {
          type: 'string',
          nullable: true,
          example: 'I am passionate about technology...',
        },
        introductionVideo: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/video.mp4',
        },
      },
    },
  })
  async updateAcademicInfo(
    @Body() dto: UpdateAcademicDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.portfolioService.updateAcademicInfo(
      dto,
      req.user as User,
      files,
    );
  }
}
