import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The IDs of the autonomous services',
  })
  serviceIds: string[];

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether to invite directly',
    example: true,
  })
  inviteDirectly: boolean;
}
