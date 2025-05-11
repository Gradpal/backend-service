import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({ type: [String], required: true })
  @IsArray()
  @IsNotEmpty()
  verificationDocuments: string[];
}
