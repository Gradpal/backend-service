import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CalendarService } from '../services/calendar.service';
import { GoogleCalendarCredentials } from '../dto/calendar.dto';
import { AuthGuard } from '@core-service/guards/auth.guard';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { User } from '../../user/entities/user.entity';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';
@Controller('portfolio/:id/calendar')
@UseGuards(AuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @PreAuthorize(EUserRole.TUTOR, EUserRole.STUDENT)
  @Get('google/auth-url')
  async getGoogleAuthUrl(@Req() req) {
    const userId = req.user.id;
    return this.calendarService.getGoogleAuthUrl(userId);
  }

  @Post('google/link')
  async linkGoogleCalendar(
    @Param('id') portfolioId: string,
    @Body() credentials: GoogleCalendarCredentials,
  ) {
    return this.calendarService.linkGoogleCalendar(portfolioId, credentials);
  }

  @Get('sync')
  async syncCalendar(@Param('id') portfolioId: string) {
    return this.calendarService.syncCalendar(portfolioId);
  }
}
