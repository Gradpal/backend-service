import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SessionPackageService } from './session-package.service';
import {
  CreateClassSessionPackageDto,
  CreatePackageTypeDto,
  AddSessionsDetailsDto,
} from './dto/create-session-package.dto';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EUserRole } from '../user/enums/user-role.enum';
import { ESessionStatus } from '../class-session/enums/session-status.enum';
import { AcceptPackageSessionDto } from '../finance/dtos/accept-package-session.dto';
import { UpdatePackageDto } from './dto/update-session-package.dto';

@Controller('session-package')
@ApiTags('Session Package')
@ApiBearerAuth()
export class SessionPackageController {
  constructor(private readonly sessionPackageService: SessionPackageService) {}

  @Post()
  @ApiOperation({ summary: 'Create session package' })
  @AuthUser()
  create(
    @Req() req,
    @Body() createClassSessionPackageDto: CreateClassSessionPackageDto,
  ) {
    return this.sessionPackageService.create(
      req.user,
      createClassSessionPackageDto,
    );
  }
  @Post('package-type')
  createPackageType(@Body() createPackageTypeDto: CreatePackageTypeDto) {
    return this.sessionPackageService.createPackageType(createPackageTypeDto);
  }

  @Get('package-type')
  findAllPackageTypes() {
    return this.sessionPackageService.findAllPackageTypes();
  }

  @Get('package-type/:id')
  findOnePackageType(@Param('id') id: string) {
    return this.sessionPackageService.findOnePackageType(id);
  }

  @Post('sessions/:id/add-session-details')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'supportingDocuments', maxCount: 10 }]),
  )
  @ApiConsumes('multipart/form-data')
  @PreAuthorize(EUserRole.STUDENT)
  addSessionDetailsToClassSession(
    @Param('id') id: string,
    @Body() addSessionsDetailsDto: AddSessionsDetailsDto,
    @UploadedFiles()
    files: {
      supportingDocuments?: Express.Multer.File[];
    },
  ) {
    return this.sessionPackageService.addSessionDetailsToClassSession(
      id,
      addSessionsDetailsDto,
      files,
    );
  }

  @Get()
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
    description: 'Status of the session package',
  })
  @ApiQuery({
    name: 'searchKeyword',
    type: String,
    required: false,
    description: 'Search keyword for the session package',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limit number for pagination',
  })
  findAllSessionPackagesLoggedInUserAndStatus(
    @Req() req,
    @Query('status') status: ESessionStatus,
    @Query('searchKeyword') searchKeyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.sessionPackageService.findAllSessionPackagesLoggedInUserAndStatus(
      req.user,
      status,
      searchKeyword,
      page,
      limit,
    );
  }

  @Get(':id')
  getSessionPackageById(@Param('id') id: string) {
    return this.sessionPackageService.getSessionPackageById(id);
  }

  @Get(':id/class-sessions')
  findAllClassSessionByPackageIdAndLoggedInUserAndStatus(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.sessionPackageService.findAllClassSessionByPackageIdAndLoggedInUserAndStatus(
      id,
      req.user,
      ESessionStatus.SCHEDULED,
    );
  }
  @Post(':packageId/package-sessions/accept')
  acceptPackageSessions(
    @Param('packageId') packageId: string,
    @Body() acceptPackageSessionDto: AcceptPackageSessionDto,
  ) {
    return this.sessionPackageService.acceptPackageSessions(
      acceptPackageSessionDto,
      packageId,
    );
  }

  @Patch('/update/package-session/:packageId')
  updatePackageSession(
    @Param('packageId') id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.sessionPackageService.updatePackageSession(id, dto);
  }
}
