import { IsString, IsOptional, IsNumber } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreatePortfolioDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  user?: User;

  @IsString()
  @IsOptional()
  university?: string;

  @IsString()
  @IsOptional()
  countryOfResidence?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
export class AddSessionLengthDto {
  @IsNumber()
  @IsOptional()
  sessionLength?: number;
}
