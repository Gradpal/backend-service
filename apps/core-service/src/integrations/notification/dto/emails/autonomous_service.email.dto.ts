import { IsString } from 'class-validator';

export class AutonomousServiceCreationEmailDto {
  @IsString()
  studentName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  description: string;
  @IsString()
  date: string;
}

export class InvitationCreationEmailDto {
  @IsString()
  teacherName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  subject: string;
}
