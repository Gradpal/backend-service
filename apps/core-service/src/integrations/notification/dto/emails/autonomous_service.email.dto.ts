import { IsString } from 'class-validator';

export class AutonomousServiceCreationEmailDto {
  @IsString()
  projectTitle: string;
  @IsString()
  description: string;
  @IsString()
  subject: string;
}

export class InvitationCreationEmailDto {
  @IsString()
  teacherName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  subject: string;
}
