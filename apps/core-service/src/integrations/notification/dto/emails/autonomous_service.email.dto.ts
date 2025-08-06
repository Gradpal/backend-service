import { IsDate, IsString } from 'class-validator';

export class AutonomousServiceCreationEmailDto {
  @IsString() studentName: string;
  @IsString() serviceTitle: string;
  @IsString() description: string;
  @IsString() date: string;
}

export class InvitationCreationEmailDto {
  @IsString() teacherName: string;
  @IsString() serviceTitle: string;
  @IsString() subject: string;
}

export class BidReceivedDto {
  firstName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  teacherName: string;
  @IsDate()
  date: Date;
}

export class BidSubmittedTeacherDto {
  @IsString()
  firstName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  studentName: string;
  @IsDate()
  date: Date;
}

export class CounterBidSubmitted {
  @IsString()
  firstName: string;
  @IsString()
  studentName: string;
  @IsString()
  serviceTitle: string;
  @IsDate()
  date: Date;
}

export class AcceptRejectBidStudentDto {
  @IsString()
  firstName: string;
  @IsString()
  teacherName: string;
  @IsString()
  serviceTitle: string;
  @IsDate()
  date: Date;
}

export class ReviewDto {
  @IsString()
  firstName: string;
  @IsString()
  serviceTitle: string;
  @IsDate()
  date: Date;
}

export class BidAcceptedRejectedDto {
  @IsString()
  firstName: string;
  @IsString()
  serviceTitle: string;
  @IsString()
  studentName: string;
  @IsDate()
  date: Date;
}
