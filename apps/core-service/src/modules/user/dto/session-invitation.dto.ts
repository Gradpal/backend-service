import { ApiProperty } from '@nestjs/swagger';

export class SessionInvitationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentProfilePicture: string;

  @ApiProperty()
  sessionDate: string;

  @ApiProperty()
  sessionTime: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  status: 'pending' | 'accepted' | 'rejected';
} 