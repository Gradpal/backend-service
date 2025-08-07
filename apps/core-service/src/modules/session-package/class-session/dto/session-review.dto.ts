import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SessionReviewDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether the session met your expectations',
    example: true,
  })
  sessionMetExpectations?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether you encountered technical issues on GradPal',
    example: false,
  })
  technicalIssuesEncountered?: boolean;

  // Teacher Performance
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether the teacher demonstrated sufficient content knowledge or acquired it when needed',
    example: true,
  })
  teacherContentKnowledge?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'How responsive the teacher was (scale of 1–5)',
    example: 4,
  })
  teacherResponsivenessRating?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether you were confident progress was being made early (within 24–48 hours)',
    example: true,
  })
  earlyProgressConfidence?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether the teacher submitted work before the deadline, giving time for review',
    example: true,
  })
  workSubmittedBeforeDeadline?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether the teacher was personable and enjoyable to work with',
    example: true,
  })
  teacherPersonable?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether the teacher asked for and incorporated your feedback',
    example: true,
  })
  teacherAskedForFeedback?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether you were satisfied with the final product created with the teacher',
    example: true,
  })
  endProductSatisfaction?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether the teacher offered post-submission support or asked follow-up questions',
    example: true,
  })
  postSubmissionSupport?: boolean;

  // Final Rating
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Overall rating for the session (1–5)',
    example: 5,
  })
  rating?: number;

  // Future Intentions
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether you would recommend this teacher to others',
    example: true,
  })
  tutorCanbeRecommended?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether you intend to work with this teacher again',
    example: true,
  })
  intendToWorkWithTutorAgain?: boolean;

  // Written Feedback
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Your public review of the session',
    example: 'This was a great session!',
  })
  review?: string;

  // System Metadata
  @IsOptional()
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @IsOptional()
  reviewedAt?: string;
}
