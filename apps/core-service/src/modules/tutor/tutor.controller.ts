import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TutorService } from './tutor.service';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { WeeklyAvailabilityDto } from './dto/weekly-availability.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { TutorListingDto } from './dto/tutor-listing.dto';
import { TutorProfileDto } from './dto/tutor-profile.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { WeeklyScheduleDto } from './dto/schedule-slot.dto';
import { Booking } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { SessionInvitationDto } from './dto/session-invitation.dto';
import { TutorDashboardDto } from './dto/tutor-dashboard.dto';

@ApiTags('Tutors')
@Controller('tutors')
@ApiBearerAuth()
export class TutorController {
  constructor(
    private readonly tutorService: TutorService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all tutors with filters and pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or university',
  })
  @ApiQuery({
    name: 'languages',
    required: false,
    type: [String],
    description: 'Filter by languages',
  })
  @ApiQuery({
    name: 'subjects',
    required: false,
    type: [String],
    description: 'Filter by subjects',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price per hour',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price per hour',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('languages') languages?: string[],
    @Query('subjects') subjects?: string[],
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.tutorService.findAll({
      page,
      limit,
      search,
      languages,
      subjects,
      minPrice,
      maxPrice,
    });
  }

  @Get(':id/profile')
  @Public()
  @ApiOperation({ summary: 'Get tutor profile by ID' })
  @ApiParam({ name: 'id', description: 'Tutor ID' })
  @ApiResponse({ status: 200, type: TutorProfileDto })
  async getProfile(@Param('id') id: string): Promise<TutorProfileDto> {
    return this.tutorService.getProfile(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'introductory_video', maxCount: 1 },
      { name: 'degree_certificates', maxCount: 10 },
    ]),
  )
  create(
    @Body() createTutorDto: CreateTutorDto,
    @UploadedFiles()
    files: {
      introductory_video?: Express.Multer.File[];
      degree_certificates?: Express.Multer.File[];
    },
  ) {
    return this.tutorService.create(createTutorDto, files);
  }

  @Put(':id/profile')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  updateProfile(
    @Param('id') id: string,
    @Body() updateTutorProfileDto: UpdateTutorProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tutorService.updateProfile(id, updateTutorProfileDto, files);
  }

  @Put(':id/availability')
  updateAvailability(
    @Param('id') id: string,
    @Body() weeklyAvailabilityDto: WeeklyAvailabilityDto,
  ) {
    return this.tutorService.updateAvailability(id, weeklyAvailabilityDto);
  }

  @Put(':id/accept-terms')
  acceptTerms(@Param('id') id: string) {
    return this.tutorService.acceptTerms(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutorService.findOne(id);
  }

  @Get(':id/schedule')
  @Public()
  @ApiOperation({ summary: 'Get tutor weekly schedule' })
  @ApiParam({ name: 'id', description: 'Tutor ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description:
      'Start date for the schedule (YYYY-MM-DD). Defaults to current week.',
  })
  @ApiResponse({ status: 200, type: WeeklyScheduleDto })
  async getSchedule(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
  ): Promise<WeeklyScheduleDto> {
    return this.tutorService.getSchedule(id, startDate);
  }

  @Get('/bookings/:id')
  @Public()
  @ApiOperation({ summary: 'Get booking details' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, type: SessionDetailsDto })
  async getBooking(@Param('id') id: string): Promise<SessionDetailsDto> {
    return this.tutorService.getBooking(id);
  }

  @Get('sessions/upcoming')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get upcoming sessions for the tutor' })
  @ApiResponse({ status: 200, type: [Booking] })
  async getUpcomingSessions(@AuthUser() user: User): Promise<Booking[]> {
    if (!user.tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    return this.tutorService.getUpcomingSessions(user.tutor.id);
  }

  @Get('sessions/:id')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, type: SessionDetailsDto })
  async getSessionDetails(@Param('id') id: string): Promise<SessionDetailsDto> {
    return this.tutorService.getBooking(id);
  }

  @Get('invitations')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session invitations for the tutor' })
  @ApiResponse({ status: 200, type: [SessionInvitationDto] })
  async getSessionInvitations(
    @AuthUser() user: User,
  ): Promise<SessionInvitationDto[]> {
    if (!user.tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    return this.tutorService.getSessionInvitations(user.tutor.id);
  }

  @Put('invitations/:id/respond')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Respond to a session invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200 })
  async respondToInvitation(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body('accept') accept: boolean,
  ): Promise<void> {
    if (!user.tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    await this.tutorService.respondToInvitation(user.tutor.id, id, accept);
  }

  @Get('dashboard')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get tutor dashboard data' })
  @ApiResponse({ status: 200, type: TutorDashboardDto })
  async getDashboard(@AuthUser() user: User): Promise<TutorDashboardDto> {
    if (!user.tutor) {
      this.exceptionHandler.throwNotFound(_404.TUTOR_NOT_FOUND);
    }
    return this.tutorService.getDashboard(user.tutor.id);
  }
}
