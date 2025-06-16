import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AddSessionTypeOfferingDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'The IDs of the session package types to add',
    type: [String],
  })
  sessionPackageTypeIds: string[];
}
