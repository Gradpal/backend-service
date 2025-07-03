import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TestFileUploadDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', description: 'Name for the file upload' })
  name: string;
}
