import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the sender',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the receiver',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  receiverId: string;
}
