import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageOwner {
  @IsString()
  @ApiProperty({
    description: 'The ID of the message owner',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The first name of the message owner',
  })
  firstName: string;

  @IsString()
  @ApiProperty({
    description: 'The last name of the message owner',
  })
  lastName: string;

  @IsString()
  @ApiProperty({
    description: 'The role of the message owner',
  })
  role: string;

  @IsString()
  @ApiProperty({
    description: 'The profile picture of the message owner',
  })
  profilePicture: string;
}
