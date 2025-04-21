import { ApiProperty } from '@nestjs/swagger';

export class SessionInvitationDto {
  @ApiProperty()
  id: string;

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
  subject: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  status: 'invited' | 'accepted' | 'rejected';

  @ApiProperty()
  createdAt: Date;
}
