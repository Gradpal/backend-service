import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLegalDocumentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Terms and Conditions', required: true })
  title: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  content: string;
}
