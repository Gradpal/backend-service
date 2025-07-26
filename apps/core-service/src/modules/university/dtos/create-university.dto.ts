import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUniversityDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'Harvard University' })
  universityName: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'United States' })
  countryName: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'harvard.edu' })
  universityEmailDomain: string;
}
