import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
  })
  content: string;

  @IsOptional()
  @ApiProperty({
    description: 'Shared files - If any',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  sharedFiles: Express.Multer.File[];
}
