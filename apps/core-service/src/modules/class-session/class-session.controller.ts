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
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { ClassSession } from './entities/class-session.entity';
import { ESessionStatus } from './enums/session-status.enum';

@ApiTags('Class Sessions')
@Controller('class-session')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class session' })
  @ApiResponse({ status: 201, type: ClassSession })
  create(@Body() createClassSessionDto: CreateClassSessionDto) {
    return this.classSessionService.create(createClassSessionDto);
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
  ) {
    return this.classSessionService.update(id, updateClassSessionDto);
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
}
