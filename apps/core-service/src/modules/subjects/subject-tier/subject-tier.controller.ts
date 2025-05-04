import {
  Controller,
  Body,
  Post,
  Param,
  Req,
  Query,
  Patch,
  Get,
} from '@nestjs/common';
import { SubjectTierService } from './subject-tier.service';
import {
  AssignBulkSubjectsDto,
  AssignSubjectsDto,
  CreateBulkSubjectTierDto,
  CreateSubjectTierDto,
  UpdateSubjectTierDto,
} from './dto/create-subject-tier.entity';
import { SubjectTier } from './entities/subject-tier.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
@Controller('subject-tier')
@ApiTags('Subject Tier')
export class SubjectTierController {
  constructor(private readonly subjectTierService: SubjectTierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  createSubjectTier(
    @Body() createSubjectTierDto: CreateSubjectTierDto,
    @Query('portfolioId') portfolioId: string,
  ): Promise<SubjectTier> {
    return this.subjectTierService.createSubjectTier(
      portfolioId,
      createSubjectTierDto,
    );
  }

  @Post('bulk')
  createBulkSubjectTier(
    @Body() createBulkSubjectTierDto: CreateBulkSubjectTierDto,
    @Query('portfolioId') portfolioId: string,
  ): Promise<SubjectTier[]> {
    return this.subjectTierService.createBulkSubjectTier(
      portfolioId,
      createBulkSubjectTierDto,
    );
  }

  @ApiParam({ name: 'portfolioId', type: String })
  @ApiBody({ type: UpdateSubjectTierDto })
  @ApiOperation({ summary: 'Get subject tiers by portfolio ID' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @Get()
  findAllByPortfolioId(
    @Query('portfolioId') portfolioId: string,
  ): Promise<SubjectTier[]> {
    return this.subjectTierService.findAllByPortfolioId(portfolioId);
  }

  @ApiParam({ name: 'portfolioId', type: String })
  @ApiBody({ type: UpdateSubjectTierDto })
  @ApiOperation({ summary: 'Update a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findOneByPortfolioIdAndSubject(
    @Param('portfolioId') portfolioId: string,
    @Param('subject') subject: string,
  ): Promise<SubjectTier> {
    return this.subjectTierService.findOneByPortfolioIdAndSubject(
      portfolioId,
      subject,
    );
  }

  @ApiParam({ name: 'portfolioId', type: String })
  @ApiBody({ type: UpdateSubjectTierDto })
  @ApiOperation({ summary: 'Update a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  updateSubjectTier(
    @Param('portfolioId') portfolioId: string,
    @Param('subject') subject: string,
    @Body() updateSubjectTierDto: UpdateSubjectTierDto,
  ): Promise<SubjectTier> {
    return this.subjectTierService.updateSubjectTier(
      portfolioId,
      subject,
      updateSubjectTierDto,
    );
  }

  @ApiBody({ type: AssignBulkSubjectsDto })
  @ApiOperation({ summary: 'Assign subjects to a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @Patch('assign-subjects')
  assignSubjects(
    @Body() assignBulkSubjectsDto: AssignBulkSubjectsDto,
    @Req() req,
  ): Promise<SubjectTier> {
    return this.subjectTierService.assignSubjects(
      req.user as User,
      assignBulkSubjectsDto,
    );
  }
}
