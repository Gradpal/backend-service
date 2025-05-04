import { IsNotEmpty, IsString } from 'class-validator';

export class CancelLessonDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
