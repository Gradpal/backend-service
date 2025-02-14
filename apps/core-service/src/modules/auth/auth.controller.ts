import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@app/common/decorators/public.decorator';
import { LoginDTO } from './dto/login.dto';
import { ActivateAccount } from './dto/activate-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { plainToClass } from 'class-transformer';
import { User } from '../user/entities/user.entity';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() dto: LoginDTO) {
    return await this.authService.login(dto);
  }
  @Patch('verify-account')
  @ApiBody({ type: ActivateAccount })
  @Public()
  async verifyAccount(@Body() dto: ActivateAccount) {
    const activatedAccount = await this.authService.verifyAccount(dto);
    return activatedAccount;
  }
  @Post('/send-otp/:email')
  @Public()
  async sendOpt(@Param('email') email: string) {
    return await this.authService.sendOpt(email);
  }

  @Patch('reset-password')
  @Public()
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const updatedAccount = await this.authService.resetPassword(dto);
    return updatedAccount;
  }
  @Get('/get-profile')
  @AuthUser() // example of tracking loggedIn user
  async getProfile(@Req() req) {
    const profile = req.user;
    return profile;
  }
}
