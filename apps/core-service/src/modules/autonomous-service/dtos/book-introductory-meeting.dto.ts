import { ApiProperty } from '@nestjs/swagger';

export class BookIntroductoryMeetingDto {
  @ApiProperty({
    description: 'The ID of the autonomous service to book',
    example: 'service-12345',
  })
  autonomousServiceId: string;

  @ApiProperty({
    description: 'The ID of the selected time slot',
    example: 'timeslot-67890',
  })
  timeSlotId: string;

  @ApiProperty({
    description: 'The ID of the tutor for the meeting',
    example: 'tutor-abcde',
  })
  tutorId: string;
}
