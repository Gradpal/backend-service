import { IsNotEmpty, IsDate, IsString } from 'class-validator';

export class RequestSessionExtensionDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsDate()
  newEndTime: Date;
}
