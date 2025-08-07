import { ApiProperty } from '@nestjs/swagger';
import { IntroBookingStatus } from '../enums/intro-booking-status.enum';

export class UpdateIntroMeetingStatusDto {
  @ApiProperty({
    description: 'Status of the introductory meeting',
    enum: IntroBookingStatus,
    example: IntroBookingStatus.APPROVED,
  })
  status: IntroBookingStatus;
}
