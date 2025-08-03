import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelLessonDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  reason: string;
}
