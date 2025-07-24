import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MoveSubjectInTiers {
  @ApiProperty({
    description: 'The tier to which the subject should be moved',
    example: 'tier-2',
  })
  @IsString()
  targetTier: string;
}
