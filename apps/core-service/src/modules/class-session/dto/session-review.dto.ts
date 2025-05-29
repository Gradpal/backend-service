import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SessionReviewDto {
  @IsNotEmpty()
  @IsString()
  review: string;

  @IsNotEmpty()
  @IsString()
  sessionMetExpectations: boolean;

  @IsNotEmpty()
  @IsString()
  technicalIssuesEncountered: boolean;

  @IsNotEmpty()
  @IsString()
  tutorCanbeRecommended: boolean;

  @IsNotEmpty()
  @IsString()
  intendToWorkWithTutorAgain: boolean;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  rating?: number;
}
