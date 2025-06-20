import { IsString, IsOptional, IsNumber } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The title of the portfolio',
    example: 'John Doe',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The description of the portfolio',
    example: 'John Doe is a software engineer',
  })
  description?: string;

  @IsOptional()
  user?: User;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The university of the portfolio',
    example: 'John Doe',
  })
  university?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The country of residence of the portfolio',
    example: 'John Doe',
  })
  countryOfResidence?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The timezone of the portfolio',
    example: 'John Doe',
  })
  timezone?: string;
}
export class AddSessionLengthDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The session length of the portfolio',
    example: 10,
  })
  sessionLength?: number;
}
