import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { DESCRIPTION_MAX_LENGTH } from '@core-service/common/constants/all.constants';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePackageTypeDto {
  @ApiProperty({ description: 'Maximum sessions' })
  @IsNumber()
  @IsNotEmpty()
  maximumSessions: number;

  @ApiProperty({ description: 'Discount percentage' })
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateClassSessionPackageDto {
  @ApiProperty({ description: 'Package type ID' })
  @IsUUID()
  @IsNotEmpty()
  packageTypeId: string;

  @ApiProperty({ description: 'Session length in minutes' })
  @IsNumber()
  @IsNotEmpty()
  sessionLength: number;

  @ApiProperty({ description: 'Tutor ID' })
  @IsUUID()
  @IsNotEmpty()
  tutorId: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Time slot IDs', required: false })
  @IsOptional()
  timeSlotIds?: string[];
}

export class AddSessionsDetailsDto {
  @ApiProperty({ description: 'URLs' })
  @IsArray()
  @IsOptional()
  urls?: string[];

  @IsOptional()
  @ApiProperty({
    description: 'This is not needed to create this request - ingore it',
  })
  attachments?: AttachmentDto[];

  @IsOptional()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  @ApiProperty({ maxLength: DESCRIPTION_MAX_LENGTH, required: false })
  @IsString()
  @IsNotEmpty()
  goalDescription: string;

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
