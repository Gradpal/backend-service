import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

export class UpdateSessionLengthDto {
  @ApiProperty({
    description: 'Array of session lengths in minutes',
    example: [15, 30, 60],
    type: [Number],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  sessionLength: number[];
}
