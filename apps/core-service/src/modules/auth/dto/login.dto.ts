import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
export class LoginResDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateNested()
  @Type(() => User)
  user: User;
}
