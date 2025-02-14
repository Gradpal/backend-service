import { IsString, IsUrl } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  userName: string;
  @IsUrl()
  activationUrl: string;
}
