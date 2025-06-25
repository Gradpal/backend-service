import { ComplaintIssueType } from '../enums/complaints.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintDto {
  @IsEnum(ComplaintIssueType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the complaint',
    enum: ComplaintIssueType,
  })
  issueType: ComplaintIssueType;

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

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the user wants a refund',
  })
  wantRefund: boolean;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The evidence file of the complaint',
    required: false,
  })
  evidenceFile: Express.Multer.File;
}
