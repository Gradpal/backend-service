import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateInvitationStageDto {
  @ApiProperty({
    description: 'ID of the autonomous service',
    example: 'e4a1d3c5-66a3-4de7-8a3f-1f6e6c2b3dce',
  })
  @IsUUID()
  autonomousServiceId: string;

  @ApiProperty({
    description: 'List of tutor IDs to update invitation stage for',
    example: [
      'c51b456b-6f93-478a-b153-33e4fcbd2da5',
      '7dbe8cb1-d7f4-4145-b329-f1fc5d1c2df8',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  tutorIds: string[];
}
