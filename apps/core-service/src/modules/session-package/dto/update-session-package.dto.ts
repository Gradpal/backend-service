import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackageDto {
  @ApiProperty({
    example: 10,
    description: 'Number of sessions in the package',
  })
  @IsNumber()
  sessionCount: number;

  @ApiProperty({
    example: 'This is a discounted package',
    description: 'Package description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: true,
    description: 'Whether this package has an offer discount',
  })
  @IsBoolean()
  offerDiscount: boolean;

  @ApiPropertyOptional({
    example: 20,
    description: 'Discount percentage if offerDiscount is true',
  })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;
}
