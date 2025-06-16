import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { SessionPackageService } from './session-package.service';
import {
  CreateClassSessionPackageDto,
  CreatePackageTypeDto,
} from './dto/create-session-package.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('session-package')
export class SessionPackageController {
  constructor(private readonly sessionPackageService: SessionPackageService) {}

  @Post()
  @ApiOperation({ summary: 'Create session package' })
  @AuthUser()
  create(
    @Req() req,
    createClassSessionPackageDto: CreateClassSessionPackageDto,
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
}
