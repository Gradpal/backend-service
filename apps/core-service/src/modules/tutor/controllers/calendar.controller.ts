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
} from '@nestjs/common';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { CalendarEvent, GoogleCalendarCredentials } from '../dto/calendar.dto';
import { TutorService } from '../tutor.service';
import { Tutor } from '../entities/tutor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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

  @Get('google/auth-url')
  async getGoogleAuthUrl() {
    return this.googleCalendarService.getAuthUrl();
  }

  @Post('google/link')
  async linkGoogleCalendar(@Body() credentials: { code: string }) {
    return this.googleCalendarService.getTokens(credentials.code);
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
