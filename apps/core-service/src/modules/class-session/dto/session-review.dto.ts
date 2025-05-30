import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SessionReviewDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The review of the class session',
    example: 'This was a great session!',
  })
  review: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the session met expectations',
    example: true,
  })
  sessionMetExpectations: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the session met expectations',
    example: true,
  })
  technicalIssuesEncountered: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the tutor can be recommended',
    example: true,
  })
  tutorCanbeRecommended: boolean;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Whether the student intends to work with the tutor again',
    example: true,
  })
  intendToWorkWithTutorAgain: boolean;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The rating of the class session',
    example: 5,
  })
  rating?: number;
}
