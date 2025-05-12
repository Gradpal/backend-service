import {
  Controller,
  Body,
  Post,
  Param,
  Req,
  Query,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { SubjectTierService } from './subject-tier.service';
import {
  CreateBulkSubjectTierDto,
  InitializeSubjectTierDto,
  MoveSubjectFromOneTierToAnotherDto,
  UpdateSubjectTierDto,
} from './dto/create-subject-tier.entity';
import { SubjectTier } from './entities/subject-tier.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('subject-tier')
@ApiTags('Subject Tier')
@ApiBearerAuth()
export class SubjectTierController {
  constructor(private readonly subjectTierService: SubjectTierService) {}

  @Post()
  @ApiOperation({ summary: 'Initialize subject tiers' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  // @PreAuthorize(EUserRole.TUTOR)
  @AuthUser()
  initializeSubjectTiers(
    @Body() initializeSubjectTierDto: InitializeSubjectTierDto,
    @Query('portfolioId') portfolioId: string,
    @Req() req,
  ): Promise<Portfolio> {
    return this.subjectTierService.initializeSubjectTiers(
      portfolioId,
      initializeSubjectTierDto,
      req.user as User,
    );
  }

  @Delete('remove-subject-tier/:subjectTierId/portfolio/:portfolioId')
  @ApiOperation({ summary: 'Remove a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  removeSubjectTier(
    @Param('subjectTierId') subjectTierId: string,
    @Param('portfolioId') portfolioId: string,
  ) {
    return this.subjectTierService.removeSubjectTier(
      portfolioId,
      subjectTierId,
    );
  }
  createBulkSubjectTier(
    @Body() createBulkSubjectTierDto: CreateBulkSubjectTierDto,
    @Query('portfolioId') portfolioId: string,
  ): Promise<SubjectTier[]> {
    return this.subjectTierService.createBulkSubjectTier(
      portfolioId,
      createBulkSubjectTierDto,
    );
  }

  @Patch('move-subject-from-one-tier-to-another')
  @ApiOperation({ summary: 'Move a subject from one tier to another' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  moveSubjectFromOneTierToAnother(
    @Body()
    moveSubjectFromOneTierToAnotherDto: MoveSubjectFromOneTierToAnotherDto,
    @Query('portfolioId') portfolioId: string,
  ) {
    return this.subjectTierService.moveSubjectFromOneTierToAnother(
      portfolioId,
      moveSubjectFromOneTierToAnotherDto,
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
  @Patch(':id')
  @PreAuthorize(EUserRole.TUTOR)
  updateSubjectTierById(
    @Param('id') id: string,
    @Body() updateSubjectTierDto: UpdateSubjectTierDto,
    @Req() req,
  ): Promise<SubjectTier> {
    return this.subjectTierService.updateSubjectTierById(
      id,
      updateSubjectTierDto,
      req.user as User,
    );
  }

  @ApiParam({ name: 'subjectId', type: String })
  @ApiParam({ name: 'subjecttierId', type: String })
  @ApiOperation({ summary: 'Assign a subject to a subject tier' })
  @ApiResponse({ type: SubjectTier })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @Patch('assign-subject/:subjectId/:subjecttierId')
  async assignSubjectsToTiers(subjectId: string, subjecttierId: string) {
    return this.subjectTierService.assignSubjectsToTiers(
      subjectId,
      subjecttierId,
    );
  }

  // @ApiBody({ type: AssignBulkSubjectsDto })
  // @ApiOperation({ summary: 'Assign subjects to a subject tier' })
  // @ApiResponse({ type: SubjectTier })
  // @ApiConsumes('application/json')
  // @ApiProduces('application/json')
  // @Patch('assign-subjects')
  // assignSubjects(
  //   @Body() assignBulkSubjectsDto: AssignBulkSubjectsDto,
  //   @Req() req,
  // ): Promise<SubjectTier> {
  //   return this.subjectTierService.assignSubjects(
  //     req.user as User,
  //     assignBulkSubjectsDto,
  //   );
  // }
}
