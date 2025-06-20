import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { SessionPackageService } from './session-package.service';
import {
  CreateClassSessionPackageDto,
  CreatePackageTypeDto,
  AddSessionsDetailsDto,
} from './dto/create-session-package.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  addSessionDetailsToClassSession(
    @Param('id') id: string,
    @Body() addSessionsDetailsDto: AddSessionsDetailsDto,
  ) {
    return this.sessionPackageService.addSessionDetailsToClassSession(
      id,
      addSessionsDetailsDto,
    );
  }
}
