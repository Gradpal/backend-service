import { IsNumber } from 'class-validator';
import { VerificationEmailDto } from './verification.email.dto';

export class WelcomeEmailDto extends VerificationEmailDto {
  @IsNumber()
  otp?: number;

  @IsNumber()
  otpValidityDuration?: number;
}
