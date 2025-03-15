import { IsString, IsNumber } from 'class-validator';
import { VerificationEmailDto } from './verification.email.dto';

export class WelcomeEmailDto extends VerificationEmailDto {
  @IsString()
  otp?: string;

  @IsNumber()
  otpValidityDuration?: number;
}
