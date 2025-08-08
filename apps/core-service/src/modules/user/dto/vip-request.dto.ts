import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestVIPDto {
  @ApiProperty({
    description: 'Full name of the requester',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the requester',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the requester',
    example: '+1 555 123 4567',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Additional message or reason for VIP access request',
    example:
      'I am a premium user and would like VIP access for early event bookings.',
  })
  @IsString()
  message: string;
}
