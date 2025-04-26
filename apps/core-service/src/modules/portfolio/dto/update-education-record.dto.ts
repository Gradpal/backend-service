import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationRecordDto } from './create-education-record.dto';

export class UpdateEducationRecordDto extends PartialType(
  CreateEducationRecordDto,
) {}
