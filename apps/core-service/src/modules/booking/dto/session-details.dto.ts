import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';
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
    isVerified: boolean;
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
