import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAutonomousServiceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The title of the autonomous service',
    example: 'Autonomous Service Title',
  })
  projectTitle: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The description of the autonomous service',
    example: 'Autonomous Service Description',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The ID of the subject',
  })
  subjectId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the owner is anonymous',
    example: true,
  })
  isOwnerAnonymous: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The contract finalization date',
    example: new Date(),
  })
  contractFinalizationDate: Date;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The final submission date',
    example: new Date(),
  })
  finalSubmissionDate: Date;

  @IsOptional()
  @ApiProperty({
    description: 'The preferred output formats',
    example: ['PDF', 'DOCX'],
    required: false,
  })
  preferredOutputFormats: string[];

  @IsOptional()
  @ApiProperty({
    description: 'Introductory meeting length in minutes',
    example: 30,
    type: 'integer',
    required: false,
  })
  introductoryMeetingLength: number;

  @IsOptional()
  @ApiProperty({
    description: 'Supporting documents - If any',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  supportingDocuments?: Express.Multer.File[];
}
