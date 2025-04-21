import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Tutor } from '../entities/tutor.entity';
import { CalendarEvent, CalendarSyncResponse } from '../dto/calendar.dto';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: any;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.getOrThrow('GOOGLE_CLIENT_ID'),
      this.configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      this.configService.getOrThrow('GOOGLE_REDIRECT_URI'),
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];
    const response = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: this.configService.getOrThrow('GOOGLE_REDIRECT_URI'),
    });
    console.log(response, '---->');
    return response;
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async syncCalendar(tutor: Tutor): Promise<CalendarSyncResponse> {
    if (!tutor.google_calendar_credentials) {
      return {
        success: false,
        message: 'Google Calendar not linked',
      };
    }

    try {
      this.oauth2Client.setCredentials(tutor.google_calendar_credentials);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // Get events for the next 30 days
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: thirtyDaysFromNow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events: CalendarEvent[] = response.data.items.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        status: event.status,
      }));

      return {
        success: true,
        message: 'Calendar synced successfully',
        events,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync calendar',
      };
    }
  }

  async addEvent(
    tutor: Tutor,
    event: CalendarEvent,
  ): Promise<CalendarSyncResponse> {
    if (!tutor.google_calendar_credentials) {
      return {
        success: false,
        message: 'Google Calendar not linked',
      };
    }

    try {
      this.oauth2Client.setCredentials(tutor.google_calendar_credentials);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
          location: event.location,
        },
      });

      return {
        success: true,
        message: 'Event added successfully',
        events: [response as unknown as CalendarEvent],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add event',
      };
    }
  }

  async updateEvent(
    tutor: Tutor,
    eventId: string,
    event: CalendarEvent,
  ): Promise<CalendarSyncResponse> {
    if (!tutor.google_calendar_credentials) {
      return {
        success: false,
        message: 'Google Calendar not linked',
      };
    }

    try {
      this.oauth2Client.setCredentials(tutor.google_calendar_credentials);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
          location: event.location,
        },
      });

      return {
        success: true,
        message: 'Event updated successfully',
        events: [response as unknown as CalendarEvent],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update event',
      };
    }
  }

  async deleteEvent(
    tutor: Tutor,
    eventId: string,
  ): Promise<CalendarSyncResponse> {
    if (!tutor.google_calendar_credentials) {
      return {
        success: false,
        message: 'Google Calendar not linked',
      };
    }

    try {
      this.oauth2Client.setCredentials(tutor.google_calendar_credentials);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete event',
      };
    }
  }
}
