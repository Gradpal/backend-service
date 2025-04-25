import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Req,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from './enums/user-role.enum';
import { Public } from '@app/common/decorators/public.decorator';
import { EUserStatus } from './enums/user-status.enum';
import { User } from './entities/user.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { WeeklyAvailabilityDto } from './dto/weekly-availability.dto';
import { WeeklyScheduleDto } from './dto/schedule-slot.dto';
import { Booking } from '../booking/entities/booking.entity';
import { SessionDetailsDto } from '../booking/dto/session-details.dto';
import { SessionInvitationDto } from './dto/session-invitation.dto';
import { TutorProfileDto } from '../portfolio/dto/tutor-profile.dto';
import { UpdateTutorProfileDto } from '../portfolio/dto/update-tutor-profile.dto';
import { TutorDashboardDto } from '../portfolio/dto/tutor-dashboard.dto';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new user',
    type: CreateUserDTO,
  })
  @ApiCreatedResponse({ type: User })
  async createUser(
    @Body() createUserDto: CreateUserDTO,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, profilePicture);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: EUserStatus.ACTIVE })
  @ApiQuery({
    name: 'role',
    required: false,
    example: EUserRole.STUDENT,
  })
  @ApiQuery({ name: 'searchKey', required: false })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getAll(
    @Query('status') status: EUserStatus,
    @Query('role') role: EUserRole,
    @Query('searchKey') searchKey: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const users = this.userService.findAll(
      page,
      limit,
      status,
      searchKey,
      role,
    );
    return users;
  }

  @Get('/email/:email')
  @ApiParam({ name: 'email', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return user;
  }

  @Get('by-id/:id')
  @ApiQuery({ name: 'id', required: true })
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: CreateUserDTO })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDTO>,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, type: User })
  async updateSettings(
    @Req() req,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<User> {
    return this.userService.updateSettings(req.user as User, updateSettingsDto);
  }

  @Delete('/:id')
  @ApiParam({ name: 'id', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
    return 'User was deleted successfully';
  }

  @Get('/get-students/')
  findAllStudents() {
    return this.userService.findAllStudents();
  }

  @Get('/get-tutors/')
  findAllLectures() {
    return this.userService.findAllTutors();
  }

  @Put(':id/tutor/profile')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Update tutor profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateTutorProfile(
    @Param('id') id: string,
    @Body() updateTutorProfileDto: UpdateTutorProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.userService.updateTutorProfile(
      id,
      updateTutorProfileDto,
      files,
    );
  }

  @Put(':id/tutor/availability')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Update tutor availability' })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateTutorAvailability(
    @Param('id') id: string,
    @Body() weeklyAvailabilityDto: WeeklyAvailabilityDto,
  ) {
    return this.userService.updateTutorAvailability(id, weeklyAvailabilityDto);
  }

  @Get(':id/tutor/profile')
  @Public()
  @ApiOperation({ summary: 'Get tutor profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: TutorProfileDto })
  getTutorProfile(@Param('id') id: string): Promise<TutorProfileDto> {
    return this.userService.getTutorProfile(id);
  }

  @Get(':id/tutor/schedule')
  @Public()
  @ApiOperation({ summary: 'Get tutor weekly schedule' })
  @ApiParam({ name: 'id', description: 'User ID' })
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
    return this.userService.getTutorSchedule(id, startDate);
  }

  @Get(':id/tutor/sessions/upcoming')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get upcoming sessions for the tutor' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: [Booking] })
  getUpcomingSessions(@Param('id') id: string): Promise<Booking[]> {
    return this.userService.getUpcomingSessions(id);
  }

  @Get(':id/tutor/sessions/:sessionId')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, type: SessionDetailsDto })
  getSessionDetails(
    @Param('sessionId') sessionId: string,
  ): Promise<SessionDetailsDto> {
    return this.userService.getSessionDetails(sessionId);
  }

  @Get(':id/tutor/invitations')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get session invitations for the tutor' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: [SessionInvitationDto] })
  getSessionInvitations(
    @Param('id') id: string,
  ): Promise<SessionInvitationDto[]> {
    return this.userService.getSessionInvitations(id);
  }

  @Get(':id/tutor/dashboard')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get tutor dashboard data' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: TutorDashboardDto })
  getTutorDashboard(@Param('id') id: string): Promise<TutorDashboardDto> {
    return this.userService.getTutorDashboard(id);
  }
}
