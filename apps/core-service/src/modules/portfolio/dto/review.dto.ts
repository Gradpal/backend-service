import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PublicReviewDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  review: string;
}
