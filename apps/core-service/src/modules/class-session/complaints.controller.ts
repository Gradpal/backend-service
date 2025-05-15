import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('complaints')
@ApiBearerAuth()
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @AuthUser()
  @Get('all/mine')
  getMyComplaints(@Req() req) {
    return this.complaintsService.getMyComplaints(req.user);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateComplaintDto })
  @UseInterceptors(FileInterceptor('evidenceFile'))
  createComplaint(
    @Body() createComplaintDto: CreateComplaintDto,
    @UploadedFile() evidenceFile: Express.Multer.File,
  ) {
    return this.complaintsService.createComplaint(
      createComplaintDto,
      evidenceFile,
    );
  }
}
