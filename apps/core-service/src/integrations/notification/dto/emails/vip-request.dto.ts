import { IsEmail, IsString } from 'class-validator';
export class VIPRequestAccessDto {
  @IsString()
  name: string;
  @IsString()
  phoneNumber: string;
  @IsString()
  message: string;
  @IsString()
  @IsEmail()
  email: string;
}
