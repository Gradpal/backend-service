import { IsNumber, IsString } from 'class-validator';
import { VerificationEmailDto } from './verification.email.dto';

export class WelcomeEmailDto extends VerificationEmailDto {
  @IsNumber()
  otp?: number;

  @IsNumber()
  otpValidityDuration?: number;
}

export class AddEmailEmailDto {
  @IsString()
  userName?: string;

  @IsNumber()
  otp?: number;

  @IsNumber()
  otpValidityDuration?: number;
}

export class rParentInvitationEmailDto {
  @IsString()
  studentName?: string;

  @IsString()
  nationalPortal?: string;

  @IsString()
  nationalPortalAdminContact?: string;

  @IsString()
  invitationUrl?: string;
}
