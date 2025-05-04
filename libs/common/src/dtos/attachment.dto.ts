import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AttachmentDto {
  @ApiProperty({
    description: 'This is not needed for creating any request - leave it null',
  })
  @IsString()
  @IsOptional()
  id: string;
  @IsOptional()
  @ApiProperty()
  type: string;
  @IsOptional()
  @ApiProperty()
  isPreviewPhoto: boolean;
  @IsOptional()
  @ApiProperty()
  path: string;
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty()
  size: number;

  constructor(
    type: string,
    isPreviewPhoto: boolean,
    path: string,
    size?: number,
    name?: string,
  ) {
    this.type = type;
    this.isPreviewPhoto = isPreviewPhoto;
    this.path = path;
    this.size = size;
    this.name = name;
  }
}
