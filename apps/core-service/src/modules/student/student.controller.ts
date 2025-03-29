import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('students')
@Controller('students')
@UseGuards(AuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Public()
  @ApiBody({
    type: CreateStudentDto,
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.studentService.create(createStudentDto, profilePicture);
  }

  @Get()
  async findAll(): Promise<Student[]> {
    return this.studentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student profile by ID' })
  @ApiResponse({ status: 200, type: Student })
  async findOne(@Param('id') id: string): Promise<Student> {
    return this.studentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentService.remove(id);
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({ status: 200, type: Student })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ): Promise<Student> {
    return await this.studentService.updateProfile(id, updateStudentProfileDto);
  }

  @Post(':id/calendars/:type')
  @ApiOperation({ summary: 'Link calendar' })
  @ApiResponse({ status: 200, type: Student })
  async linkCalendar(
    @Param('id') id: string,
    @Param('type') type: 'apple' | 'google',
    @Body('token') token: string,
  ): Promise<Student> {
    return await this.studentService.linkCalendar(id, type, token);
  }

  @Delete(':id/calendars/:type')
  @ApiOperation({ summary: 'Unlink calendar' })
  @ApiResponse({ status: 200, type: Student })
  async unlinkCalendar(
    @Param('id') id: string,
    @Param('type') type: 'apple' | 'google',
  ): Promise<Student> {
    return await this.studentService.unlinkCalendar(id, type);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get complete student dashboard data' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getDashboard(
    @AuthUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days
    return this.studentService.getDashboardData(user.id, start, end);
  }

  @Post('tutors/:tutorId/save')
  @ApiOperation({ summary: 'Save a tutor' })
  @ApiResponse({ status: 200 })
  async saveTutor(@AuthUser() user: User, @Param('tutorId') tutorId: string) {
    return this.studentService.saveTutor(user.id, tutorId);
  }

  @Delete('tutors/:tutorId/unsave')
  @ApiOperation({ summary: 'Remove tutor from saved list' })
  @ApiResponse({ status: 200 })
  async unsaveTutor(@AuthUser() user: User, @Param('tutorId') tutorId: string) {
    return this.studentService.unsaveTutor(user.id, tutorId);
  }
}
