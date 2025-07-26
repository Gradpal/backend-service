import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNationalPortalDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the country',
    example: 'United States',
  })
  countryName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The email of the country',
    example: 'usa@gmail.com',
  })
  countryEmail: string;
}
