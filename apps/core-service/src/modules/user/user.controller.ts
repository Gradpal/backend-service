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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
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
import { User } from './entities/user.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new user',
    type: CreateUserDTO,
  })
  @ApiCreatedResponse({ type: User })
  async createUser(
    @Body() createUserDto: CreateUserDTO,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, profilePicture);
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
  @ApiParam({ name: 'email', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return user;
  }

  @Get('by-id/:id')
  @ApiQuery({ name: 'id', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  async getUserById(@Query('id') id: string) {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: CreateUserDTO })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDTO>,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, type: User })
  async updateSettings(
    @AuthUser() user: User,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<User> {
    return this.userService.updateSettings(user, updateSettingsDto);
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
