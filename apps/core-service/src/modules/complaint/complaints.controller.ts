import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { CreateComplaintDto } from './dtos/create-complaint.dto';
import {
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EComplaintStatus } from './enums/complaint-status.enum';
import { EUserRole } from '../user/enums/user-role.enum';
import { SessionComplaintReviwDecisionDto } from './dtos/complaint-review.dto';

@Controller('complaints')
@ApiTags('Complaints')
@ApiBearerAuth()
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateComplaintDto })
  @UseInterceptors(FilesInterceptor('supportingDocuments', 3))
  createComplaint(
    @Body() createComplaintDto: CreateComplaintDto,
    @UploadedFiles() supportingDocuments: Express.Multer.File[],
  ) {
    return this.complaintsService.createComplaint(
      createComplaintDto,
      supportingDocuments,
    );
  }
  @AuthUser()
  @Get('all/mine')
  @ApiOperation({ summary: 'Get all complaints for the logged in user' })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'searchKeyword', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @PreAuthorize(EUserRole.STUDENT, EUserRole.TUTOR)
  getMyComplaints(
    @Req() req,
    @Query('status') status: EComplaintStatus,
    @Query('searchKeyword') searchKeyword: string,
    @Query('page') page: number = 2,
    @Query('limit') limit: number = 10,
  ) {
    return this.complaintsService.getMyComplaints(
      req.user,
      status,
      searchKeyword,
      page,
      limit,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints for the logged in user' })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiQuery({ name: 'searchKeyword', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  getAllComplaints(
    @Query('status') status: EComplaintStatus,
    @Query('searchKeyword') searchKeyword: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.complaintsService.getAllComplaints(
      status,
      searchKeyword,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by id' })
  @PreAuthorize(EUserRole.STUDENT, EUserRole.TUTOR, EUserRole.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  getComplaintById(@Param('id') id: string) {
    return this.complaintsService.getComplaintById(id);
  }
  @Get(':id/details')
  @ApiOperation({ summary: 'Get complaint details' })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: String })
  getComplaintDetails(@Param('id') id: string) {
    return this.complaintsService.getComplaintDetails(id);
  }
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve complaint' })
  @PreAuthorize(EUserRole.SUPER_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('supportingDocuments', 3)) // Handle multiple files (max 10)
  @ApiBody({ type: SessionComplaintReviwDecisionDto })
  @ApiParam({ name: 'id', type: String })
  resolveComplaint(
    @Param('id') id: string,
    @Body() resolveComplaintDto: SessionComplaintReviwDecisionDto,
    @UploadedFiles() supportingDocuments: Express.Multer.File[],
  ) {
    return this.complaintsService.resolveComplaint(
      id,
      resolveComplaintDto,
      supportingDocuments || [],
    );
  }
}
