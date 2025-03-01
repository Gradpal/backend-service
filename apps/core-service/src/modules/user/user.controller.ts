import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { _errors } from '@app/common/helpers/shared.helpers';
import { _404, _409 } from '@app/common/constants/errors-constants';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from './enums/user-role.enum';
import { Public } from '@app/common/decorators/public.decorator';
import { EUserStatus } from './enums/user-status.enum';
import { CreateAdminDTO } from './dto/create-admin.dto';
import { User } from './entities/user.entity';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { ConfirmUserProfileDto } from './dto/confirm-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // TODO: this endpoint should be removed or refactored, it exist only for demonstration purposes
  @Post('/onboard/:registrationNumber')
  @ApiParam({ name: 'registrationNumber', required: true })
  @Public()
  @ApiOperation({
    summary: 'use this api to onboard new student to this platform',
  })
  @Patch('/onboard/confirm-profile')
  @Public()
  @ApiOperation({
    summary: 'use this api to confirm user details',
  })
  async confirmUserProfile(@Body() confirmProfileDto: ConfirmUserProfileDto) {
    return await this.userService.confirmUserProfile(confirmProfileDto);
  }

  @Post()
  @ApiBody({ type: CreateUserDTO })
  @ApiConflictResponse(_errors([_409.USER_ALREADY_EXISTS]))
  @ApiCreatedResponse({ type: [User] })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  createUser(@Body() createUserDto: CreateUserDTO) {
    return this.userService.create(createUserDto);
  }

  @Post('admin')
  @ApiConflictResponse(_errors([_409.USER_ALREADY_EXISTS]))
  @ApiCreatedResponse({ type: [User] })
  @ApiBody({ type: CreateAdminDTO })
  @Public()
  createAdmin(@Body() createUserDto: CreateAdminDTO) {
    return this.userService.createAdmin(createUserDto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: EUserStatus.ACTIVE })
  @ApiQuery({
    name: 'role',
    required: false,
    example: EUserRole.STUDENT,
  })
  @ApiQuery({ name: 'searchKey', required: false })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getAll(
    @Query('status') status: EUserStatus,
    @Query('role') role: EUserRole,
    @Query('searchKey') searchKey: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const users = this.userService.findAll(
      page,
      limit,
      status,
      searchKey,
      role,
    );
    return users;
  }

  @Get('/email/:email')
  @ApiNotFoundResponse(_errors([_404.USER_NOT_FOUND]))
  @ApiParam({ name: 'email', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return user;
  }

  @Get('by-id/:id')
  @ApiNotFoundResponse(_errors([_404.USER_NOT_FOUND]))
  @ApiQuery({ name: 'id', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getUserById(@Query('id') id: string) {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiNotFoundResponse(_errors([_404.USER_NOT_FOUND]))
  @ApiBody({ type: CreateUserDTO })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDTO>,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('update/settings')
  @AuthUser()
  @ApiBody({ type: UpdateSettingsDto })
  updateSettings(@Req() req, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user as User, updateSettingsDto);
  }

  @Delete('/:id')
  @ApiParam({ name: 'id', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
    return 'User was deleted successfully';
  }

  @Get('/get-students/')
  findAllStudents() {
    return this.userService.findAllStudents();
  }

  @Get('/get-tutors/')
  findAllLectures() {
    return this.userService.findAllTutors();
  }
}
