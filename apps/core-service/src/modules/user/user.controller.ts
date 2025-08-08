import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  Req,
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
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { EUserRole } from './enums/user-role.enum';
import { Public } from '@app/common/decorators/public.decorator';
import { EUserStatus } from './enums/user-status.enum';
import { User } from './entities/user.entity';
import {
  DeactivateUserDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNationalPortalAdminDTO } from './dto/create-admin.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GrpcServices,
  UserGrpcMethods,
} from '@core-service/common/constants/grpc.constants';
import { LoadChatUserByIdRequest } from './dto/grpc/load-chat-user-by-id.dto';
import { RequestVIPDto } from './dto/vip-request.dto';

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

  @Post('/national-portal-admin')
  @Public()
  @ApiBody({ type: CreateNationalPortalAdminDTO })
  async createNationalPortalAdmin(
    @Body() createNationalPortalAdminDto: CreateNationalPortalAdminDTO,
  ) {
    return this.userService.createNationalPortalAdmin(
      createNationalPortalAdminDto,
    );
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

  @Get('by-id/:userId')
  @Public()
  async getUserById(@Param('userId') userId: string) {
    const user = await this.userService.findOne(userId);
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

  @Patch('update/settings')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, type: User })
  @AuthUser()
  async updateSettings(
    @Req() req,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<User> {
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

  @Patch('/terms-and-conditions/accept')
  @AuthUser()
  acceptTermsAndConditions(@Req() req) {
    const loggedInUser = req.user as User;
    return this.userService.acceptTermsAndConditions(loggedInUser);
  }

  @Patch('/deactivate/:userId')
  @ApiParam({ name: 'userId', required: true })
  @ApiBody({ type: DeactivateUserDto })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  deactivateUser(
    @Param('userId') userId: string,
    @Body() deactivateUserDto: DeactivateUserDto,
  ) {
    return this.userService.deactivateUser(userId, deactivateUserDto);
  }

  @Patch('/activate/:userId')
  @ApiParam({ name: 'userId', required: true })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  activateUser(@Param('userId') userId: string) {
    return this.userService.activateUser(userId);
  }
  // Parent Controllers

  @Post('/invite-parent/:parentEmail')
  @ApiParam({ name: 'parentEmail', required: true })
  @AuthUser()
  inviteParent(@Param('parentEmail') parentEmail: string, @Req() req) {
    const student = req.user as User;
    return this.userService.inviteParentByEmail(parentEmail, student);
  }

  @Post('/accept-parent-invitation/:parentEmail')
  @Public()
  @ApiParam({ name: 'parentEmail', required: true })
  @ApiBody({ type: AcceptInvitationDto })
  acceptParentInvitation(
    @Param('parentEmail') parentEmail: string,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    return this.userService.acceptParentInvitation(
      parentEmail,
      acceptInvitationDto,
    );
  }

  @Get('/children/logged-in-parent')
  @AuthUser()
  @ApiResponse({
    status: 200,
    description: 'Get children by logged in parent',
    type: [User],
  })
  getChildrenByLoggedInParent(@Req() req) {
    const parent = req.user as User;
    return this.userService.getChildren(parent);
  }
  ///////////////////////  ///////////////////////  ///////////////////////  ///////////////////////
  @Post('/create-random-dummy-users')
  @Public()
  createRandomDummyUsers() {
    return this.userService.createRandomDummyUsers();
  }

  @Post('/test/upload-file')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My File Name' },
        picture: { type: 'string', format: 'binary' },
      },
      required: ['name', 'picture'],
    },
  })
  @Public()
  testUploadFile(@UploadedFile() picture: Express.Multer.File) {
    console.log('File:', picture);
    return this.userService.testUploadFile(picture);
  }

  // GRPC CONTROLLERS
  @GrpcMethod(GrpcServices.USER_SERVICE, UserGrpcMethods.LOAD_CHART_USER_BY_ID)
  loadChartUserById(payload: LoadChatUserByIdRequest) {
    return this.userService.loadChartUserById(payload);
  }

  @Get('/children/:parentId')
  getMyChildren(@Param('parentId') parentId: string) {
    return this.userService.getMyChildren(parentId);
  }

  @Patch('/vacation/vacation-mode/activate')
  @ApiOperation({ summary: 'Activate vacation mode for tutor' })
  @ApiResponse({
    status: 200,
    description: 'Vacation mode activated successfully',
    type: User,
  })
  @AuthUser()
  @PreAuthorize(EUserRole.TUTOR)
  async activateVacationMode(@Req() req) {
    const user = req.user as User;
    return this.userService.activateVacationMode(user);
  }

  @Patch('/vacation/vacation-mode/deactivate')
  @ApiOperation({ summary: 'Deactivate vacation mode for tutor' })
  @ApiResponse({
    status: 200,
    description: 'Vacation mode deactivated successfully',
    type: User,
  })
  @AuthUser()
  @PreAuthorize(EUserRole.TUTOR)
  async deactivateVacationMode(@Req() req) {
    const user = req.user as User;
    return this.userService.deactivateVacationMode(user);
  }
  @Patch('/user/vip-request')
  @AuthUser()
  async requestVIPAccess(@Req() req: any, @Body() dto: RequestVIPDto) {
    const user = req.user as User;
    return this.userService.requestVip(user, dto);
  }
}
