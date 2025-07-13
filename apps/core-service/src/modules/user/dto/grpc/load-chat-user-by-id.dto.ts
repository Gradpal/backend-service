import { IsString } from 'class-validator';

export class LoadChatUserByIdRequest {
  @IsString()
  id: string;
}
