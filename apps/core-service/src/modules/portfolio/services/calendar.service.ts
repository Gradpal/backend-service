import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { GoogleCalendarCredentials } from '../dto/calendar.dto';
import { OAuth2Client } from 'google-auth-library';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';

@Injectable()
export class CalendarService {
  private oauth2Client: OAuth2Client;

  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    private readonly configService: CoreServiceConfigService,
  ) {
    this.oauth2Client = new OAuth2Client(
      this.configService.googleClientId,
      this.configService.googleClientSecret,
      this.configService.googleRedirectUri,
    );
  }

  async getGoogleAuthUrl(userId: string): Promise<string> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: portfolio.id,
    });

    return url;
  }

  async linkGoogleCalendar(
    portfolioId: string,
    credentials: GoogleCalendarCredentials,
  ) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const { tokens } = await this.oauth2Client.getToken(credentials.code);
    portfolio.google_calendar_credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    };
    portfolio.google_calendar_linked = true;

    await this.portfolioRepository.save(portfolio);

    return {
      success: true,
      message: 'Google Calendar linked successfully',
    };
  }

  async syncCalendar(portfolioId: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio || !portfolio.google_calendar_linked) {
      throw new Error('Portfolio not found or Google Calendar not linked');
    }

    // Implement calendar sync logic here
    return {
      success: true,
      message: 'Calendar synced successfully',
    };
  }
}
