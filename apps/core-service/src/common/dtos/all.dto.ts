import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, MaxLength } from 'class-validator';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { DESCRIPTION_MAX_LENGTH } from '../constants/all.constants';

export class DtoAudit {
  @IsOptional()
  @ApiProperty({ required: false, default: new Date() })
  createdAt: Date = new Date();

  @IsOptional()
  @ApiProperty({ required: false, default: new Date() })
  updatedAt: Date = new Date();
}

export class BaseDto extends DtoAudit {
  @ApiProperty({
    description: 'This is not needeed for creating any request - leave it null',
    required: false,
  })
  @IsOptional()
  id?: string;

  @IsOptional()
  @ApiProperty({
    description: 'This is not needed to create this request - ingore it',
  })
  attachments?: AttachmentDto[];

  @IsOptional()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  @ApiProperty({ maxLength: DESCRIPTION_MAX_LENGTH, required: false })
  description?: string;

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

export class TimeRangeDTO {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
