import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDTO } from './create-user.dto';

export class CreateAdminDTO extends CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  adminRegistrationCode: string; // The secret code for registering admin - just verify if the API is being executed legally.
}
