import { Controller, Post, Body, Param, Patch, Req } from '@nestjs/common';
import { TutorService } from './tutor.service';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';

@Controller('tutor')
@ApiBearerAuth()
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Patch('/profile')
  @AuthUser()
  @PreAuthorize(EUserRole.TUTOR)
  async updateProfile(@Req() req, @Body() updates: UpdateTutorProfileDto) {
    await this.tutorService.updateProfile(req.user as User, updates);
    return { message: 'Profile updated successfully' };
  }
}
