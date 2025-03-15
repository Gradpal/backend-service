import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDTO } from '../../user/dto/create-user.dto';

export class CreateTutorDto extends CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone_number?: string;

  @ApiProperty()
  @IsNotEmpty()
  citizenship?: any;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referal_code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refererId: string;
}
