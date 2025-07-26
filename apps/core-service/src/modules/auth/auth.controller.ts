import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@app/common/decorators/public.decorator';
import { LoginDTO } from './dto/login.dto';
import { ActivateAccount } from './dto/activate-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../user/entities/user.entity';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';

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

  @Post('/send-otp/:email')
  @Public()
  async sendOpt(@Param('email') email: string) {
    return await this.authService.sendOpt(email, true);
  }

  @Post('/send-otp-additional-email/:email')
  @ApiParam({ name: 'email', type: String, example: 'test@example.com' })
  async sendOptAdditionalEmail(@Param('email') email: string) {
    return await this.authService.sendOpt(email);
  }

  @Public()
  @Post('/verify-email')
  @ApiBody({ type: ActivateAccount })
  async verifyEmail(@Body() dto: ActivateAccount) {
    const activatedAccount = await this.authService.verifyAccount(dto);
    return activatedAccount;
  }

  @Public()
  @Post('/forgot-password')
  @ApiBody({ type: ForgotPasswordDTO })
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('/reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const updatedAccount = await this.authService.resetPassword(dto);
    return updatedAccount;
  }

  @Get('/get-profile')
  async getProfile(@Req() req) {
    return req.user as User;
  }
}
