import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
  Query,
  Req,
} from '@nestjs/common';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { CalendarEvent, GoogleCalendarCredentials } from '../dto/calendar.dto';
import { TutorService } from '../tutor.service';
import { Tutor } from '../entities/tutor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@core-service/modules/user/entities/user.entity';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';

@Controller('tutor/calendar')
@ApiTags('Tutor Calendar')
@ApiBearerAuth()
export class CalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly tutorService: TutorService,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
  ) {}

  @PreAuthorize(EUserRole.TUTOR)
  @Get('google/auth-url')
  async getGoogleAuthUrl(@Req() req) {
    return this.googleCalendarService.getAuthUrl(req.user);
  }

  @Post('google/link')
  @PreAuthorize(EUserRole.TUTOR)
  async linkGoogleCalendar(@Body() data: { code: string }, @Req() req) {
    return this.googleCalendarService.handleCallback(data.code, req.user);
  }

  @Post('sync')
  async syncCalendar(@Body() tutor: Tutor) {
    return this.googleCalendarService.syncCalendar(tutor);
  }

  @Post('events')
  async addEvent(@Body() data: { tutor: Tutor; event: any }) {
    return this.googleCalendarService.addEvent(data.tutor, data.event);
  }

  @Put('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() data: { tutor: Tutor; event: any },
  ) {
    return this.googleCalendarService.updateEvent(
      data.tutor,
      eventId,
      data.event,
    );
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Body() data: { tutor: Tutor },
  ) {
    return this.googleCalendarService.deleteEvent(data.tutor, eventId);
  }
}
