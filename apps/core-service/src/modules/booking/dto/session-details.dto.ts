import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class TimelineEvent {
  @ApiProperty()
  action: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  by: string;
}

export class DocumentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

export class SessionDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionDate: string;

  @ApiProperty()
  sessionTime: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  tutor: {
    id: string;
    name: string;
    university: string;
    profilePicture: string;
    countryCode: string;
  };

  @ApiProperty()
  student?: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
  };

  @ApiProperty()
  subject: string;

  @ApiProperty()
  duration: string;

  @ApiProperty()
  creditsUsed: number;

  @ApiProperty()
  communicationTool: {
    name: string;
    description: string;
    joinUrl?: string;
  };

  @ApiProperty({ type: [TimelineEvent] })
  timeline: TimelineEvent[];

  @ApiProperty({ type: [DocumentDto] })
  documents: DocumentDto[];

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;
}
