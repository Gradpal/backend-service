import { CreateUserDTO } from '@core-service/modules/user/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto extends CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  academicLevel?: string;

  @ApiProperty({ required: false })
  @IsString()
  subjectsOfInterest?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  languages?: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  preferredLeaningStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  credits?: number;
}
