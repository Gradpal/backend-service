import { ComplaintIssueType } from '../enums/complaints.enum';

import { ComplaintPriority } from '../enums/complaints.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintDto {
  @IsEnum(ComplaintIssueType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the complaint',
    enum: ComplaintIssueType,
  })
  issueType: ComplaintIssueType;

  @IsEnum(ComplaintPriority)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The priority of the complaint',
    enum: ComplaintPriority,
  })
  priority: ComplaintPriority;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the complaint',
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The session id of the complaint',
  })
  sessionId: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The evidence file of the complaint',
  })
  evidenceFile: Express.Multer.File;
}
