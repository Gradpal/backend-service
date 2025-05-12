import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dtos/create-subject.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('subjects')
@Controller('subjects')
@ApiBearerAuth()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  // @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 409, description: 'Subject already exists' })
  createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.createSubject(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({ status: 200, description: 'Return all subjects' })
  @Public()
  getSubjects() {
    return this.subjectsService.getSubjects();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by id' })
  @ApiResponse({ status: 200, description: 'Return the subject' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  getSubjectById(@Param('id') id: string) {
    return this.subjectsService.getSubjectById(id);
  }
}
