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
import { RegisterDTO } from './dto/register.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { CreateUserDTO } from '../user/dto/create-user.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  @ApiBody({ type: RegisterDTO })
  async register(@Body() dto: CreateUserDTO) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('/login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() dto: LoginDTO) {
    return await this.authService.login(dto);
  }

  @Post('/send-otp/:email')
  @Public()
  async sendOpt(@Param('email') email: string) {
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
  async getProfile(@AuthUser() user: User) {
    return user;
  }
}
