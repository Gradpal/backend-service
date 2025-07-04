import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateLegalDocumentDto } from './dtos/create-legal-document.dto';
import { ELegalDocumentStatus } from './enums/legal-document-status.enum';
import { PreAuthorize } from '@core-service/decorators/auth.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { ELegalDocumentType } from './enums/legal-document-type.enum';

@Controller('app')
@ApiTags('App')
@ApiBearerAuth()
@PreAuthorize(EUserRole.SUPER_ADMIN)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('legal-document')
  async createLegalDocument(
    @Body() createLegalDocumentDto: CreateLegalDocumentDto,
  ) {
    return this.appService.createLegalDocument(createLegalDocumentDto);
  }

  @Put('legal-document/:id')
  async updateLegalDocument(
    @Param('id') id: string,
    @Body() updateLegalDocumentDto: CreateLegalDocumentDto,
  ) {
    return this.appService.updateLegalDocument(id, updateLegalDocumentDto);
  }

  @Put('legal-document/:id/title')
  async updateLegalDocumentTitle(
    @Param('id') id: string,
    @Body() updateLegalDocumentDto: CreateLegalDocumentDto,
  ) {
    return this.appService.updateLegalDocumentTitle(id, updateLegalDocumentDto);
  }

  @Put('legal-document/:id/publish')
  async publishLegalDocument(@Param('id') id: string) {
    return this.appService.publishLegalDocument(id);
  }

  @Get('legal-document/:id')
  async getLegalDocument(@Param('id') id: string) {
    return this.appService.getLegalDocument(id);
  }

  @Get()
  @ApiQuery({
    name: 'status',
    type: String,
    enum: ELegalDocumentStatus,
    required: false,
  })
  @ApiQuery({
    name: 'searchKey',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'type',
    type: String,
    enum: ELegalDocumentType,
    required: false,
  })
  async getLegalDocuments(
    @Query('status') status?: ELegalDocumentStatus,
    @Query('searchKey') searchKey?: string,
    @Query('type') type?: ELegalDocumentType,
  ) {
    return this.appService.getLegalDocuments(status, searchKey, type);
  }
}
