import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { CreateNationalPortalDto } from './dtos/create-national-portal.dto';
import { Query } from '@nestjs/common';
import { EPortalStatus } from './enums/portal-status.enum';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';
import { PreAuthorize } from '@core-service/decorators/auth.decorator';

@Controller('portal')
@ApiTags('Portal')
@ApiBearerAuth()
@PreAuthorize(EUserRole.SUPER_ADMIN)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}
  @Post()
  createNationalPortal(
    @Body() createNationalPortalDto: CreateNationalPortalDto,
  ) {
    return this.portalService.createNationalPortal(createNationalPortalDto);
  }
  @Get()
  @ApiQuery({
    name: 'status',
    type: String,
    enum: EPortalStatus,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  getAllNationalPortals(
    @Query('status') status: EPortalStatus,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.portalService.getAllNationalPortals(status, page, limit);
  }
  @Get(':id')
  getNationalPortalById(@Param('id') id: string) {
    return this.portalService.getNationalPortalById(id);
  }
  @Put(':id')
  updateNationalPortal(
    @Param('id') id: string,
    @Body() updateNationalPortalDto: CreateNationalPortalDto,
  ) {
    return this.portalService.updateNationalPortal(id, updateNationalPortalDto);
  }
  @Delete(':id')
  deleteNationalPortal(@Param('id') id: string) {
    return this.portalService.deleteNationalPortal(id);
  }
  @Put(':id/activate')
  activateNationalPortal(@Param('id') id: string) {
    return this.portalService.activateOrDeactivateNationalPortal(
      id,
      EPortalStatus.ACTIVE,
    );
  }
  @Put(':id/deactivate')
  deactivateNationalPortal(@Param('id') id: string) {
    return this.portalService.activateOrDeactivateNationalPortal(
      id,
      EPortalStatus.INACTIVE,
    );
  }
}
