import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationInstitutionRecordDto } from './create-education-record.dto';

export class UpdateEducationRecordDto extends PartialType(
  CreateEducationInstitutionRecordDto,
) {}
