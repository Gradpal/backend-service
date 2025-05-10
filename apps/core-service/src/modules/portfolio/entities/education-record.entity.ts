import { BaseDto } from '@core-service/common/dtos/all.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class EducationInstitutionRecord extends BaseDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  degree: string;

  // @Column({ type: 'varchar', length: 255 })
  // fieldOfStudy: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  isCurrent: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  certificate: string;
}
