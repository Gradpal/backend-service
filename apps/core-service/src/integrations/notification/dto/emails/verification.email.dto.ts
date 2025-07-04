import { IsString, IsUrl } from 'class-validator';

export class VerificationEmailDto {
  @IsString()
  userName?: string;

  @IsUrl()
  verificationUrl?: string;
}
