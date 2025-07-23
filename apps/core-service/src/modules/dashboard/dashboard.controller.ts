import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '@notification-service/common/decorators/auth-checker.decorator';
import { AuthGuard } from '@core-service/guards/auth.guard';
import { StudentScheduleAndCreditsResponseDTO } from './dto/schedule-credits.dto';
import { AchievementSummaryResponseDTO } from './dto/achievement.dto';
import { TimeRangeDTO } from '@core-service/common/dtos/all.dto';

@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('/students/:studentId/schedule')
  @ApiOperation({ summary: 'Get schedule for a student' })
  @ApiParam({ name: 'studentId', description: 'student ID' })
  @AuthUser()
  @ApiResponse({
    status: 200,
    description: 'Get  sessions schedule and  credits for a student',
    type: StudentScheduleAndCreditsResponseDTO,
  })
  getStudentScheduleAndCredits(@Param('studentId') studentId: string) {
    return this.dashboardService.getStudentScheduleAndCredits(studentId);
  }

  @Get('/student/:studentId/achievements')
  @AuthUser()
  @ApiOperation({ summary: 'Get achievements for a student' })
  @ApiParam({ name: 'studentId', description: 'student ID' })
  @ApiExtraModels(TimeRangeDTO)
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Get  achievements for a student',
    type: AchievementSummaryResponseDTO,
  })
  getAchievements(
    @Param('studentId') studentId: string,
    @Query() timeRange: TimeRangeDTO,
  ) {
    return this.dashboardService.getStudentAchievements(studentId, timeRange);
  }
}
