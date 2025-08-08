import { IsOptional, IsString } from 'class-validator';

export class AccountUpdateDto {
  @IsString()
  userName: string;
  @IsOptional()
  message?: string;
}
