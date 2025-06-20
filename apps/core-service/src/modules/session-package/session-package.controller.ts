import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EUserRole } from '../user/enums/user-role.enum';

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
}
