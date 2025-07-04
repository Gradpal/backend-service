import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the student',
  })
  studentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the invitation',
  })
  invitationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The first name of the parent',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The last name of the parent',
  })
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the parent',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({
    description: 'The password of the parent',
    example: 'Password@123',
  })
  password: string;
}
