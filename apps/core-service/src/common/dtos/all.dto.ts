import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'This is not needeed for creating any request - leave it null',
    required: false,
  })
  @IsOptional()
  id: string;

  @IsOptional()
  @ApiProperty({
    description:
      'Use this just in case a user suggest new skills that are not stored in a database',
  })
  skillsDto?: string[];

  @IsOptional()
  @IsOptional()
  @ApiProperty()
  description: string;

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
  supportingDocuments: Express.Multer.File[];
}
