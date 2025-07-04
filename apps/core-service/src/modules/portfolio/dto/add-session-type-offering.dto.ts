import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionTypeOfferingDto {
  @IsString()
  @ApiProperty({
    description: 'The ID of the session package type',
    type: String,
  })
  sessionPackageTypeId: string;

  @IsNumber()
  @ApiProperty({
    description: 'The discount to add',
    type: Number,
  })
  discount: number;
}
export class AddSessionTypeOfferingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionTypeOfferingDto)
  @ApiProperty({
    description: 'The SessionTypeOfferings to add',
    type: [SessionTypeOfferingDto],
  })
  sessionTypeOfferings: SessionTypeOfferingDto[];
}
