import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ESubjectCategory } from '../enums/ESubjectCategory.enum';
import { ApiProperty } from '@nestjs/swagger';
export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsEnum(ESubjectCategory)
  @IsNotEmpty()
  @ApiProperty({ enum: ESubjectCategory })
  category: ESubjectCategory;
}
