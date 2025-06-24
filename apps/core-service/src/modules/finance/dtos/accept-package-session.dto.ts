import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class AcceptPackageSessionDto {
  @ValidateNested({ each: true })
  @Type(() => String)
  @ApiProperty({ type: String, isArray: true })
  sessionIds: string[];
}
