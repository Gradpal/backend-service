import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import {
  CreateSubjectCategoryDto,
  CreateSubjectDto,
} from './dtos/create-subject.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('subjects')
@Controller('subjects')
@ApiBearerAuth()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 409, description: 'Subject already exists' })
  createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.createSubject(createSubjectDto);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  updateSubject(
    @Param('id') id: string,
    @Body() updateSubjectDto: CreateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(id, updateSubjectDto);
  }
  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a subject category' })
  @ApiResponse({
    status: 200,
    description: 'Subject category updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Subject category not found' })
  updateSubjectCategory(
    @Param('id') id: string,
    @Body() updateSubjectCategoryDto: CreateSubjectCategoryDto,
  ) {
    return this.subjectsService.updateSubjectCategory(
      id,
      updateSubjectCategoryDto,
    );
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
  @Post('categories')
  @ApiOperation({ summary: 'Create a new subject category' })
  @ApiResponse({
    status: 201,
    description: 'Subject category created successfully',
  })
  @ApiResponse({ status: 409, description: 'Subject category already exists' })
  createSubjectCategory(
    @Body() createSubjectCategoryDto: CreateSubjectCategoryDto,
  ) {
    return this.subjectsService.createSubjectCategory(createSubjectCategoryDto);
  }
  @Get('categories/all')
  @ApiOperation({ summary: 'Get all subject categories' })
  @ApiQuery({
    name: 'searchKey',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Return all subject categories' })
  @Public()
  getSubjectCategories(
    @Query('searchKey') searchKey?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.subjectsService.getSubjectCategories(searchKey, page, limit);
  }
}
