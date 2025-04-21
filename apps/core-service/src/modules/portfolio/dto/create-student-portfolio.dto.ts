import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStudentPortfolioDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  countryOfResidence: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timezoneDisplayFormat: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timezone: string;
}
