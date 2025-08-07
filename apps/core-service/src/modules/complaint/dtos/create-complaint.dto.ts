import { ComplaintIssueType } from '../enums/complaints.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplaintCategory } from '../enums/complaint-category.enum';

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

  @IsEnum(ComplaintCategory)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The category of the complaint',
    enum: ComplaintCategory,
  })
  category: ComplaintCategory;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The session id of the complaint',
    required: false,
  })
  sessionId?: string;

  @IsOptional()
  @ApiProperty({
    description: 'The service id of the complaint',
    required: false,
  })
  serviceId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the user wants a refund',
  })
  @IsOptional()
  wantRefund?: boolean;

  @ApiPropertyOptional({
    description: ' the user  refund percentage',
    required: false,
  })
  @IsOptional()
  refundPercentage?: number;

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
