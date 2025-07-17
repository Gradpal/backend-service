import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AutonomousServiceService } from './autonomous-service.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { CreateAutonomousServiceDto } from './dtos/create-autonomous-service.dto';
import { AuthUser } from '@core-service/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('autonomous-service')
@ApiTags('Autonomous Service')
@ApiBearerAuth()
export class AutonomousServiceController {
  constructor(
    private readonly autonomousServiceService: AutonomousServiceService,
  ) {}

  @Post()
  @AuthUser()
  @ApiOperation({ summary: 'Create an autonomous service' })
  @ApiResponse({
    status: 201,
    description: 'The autonomous service has been successfully created.',
  })
  @UseInterceptors(FilesInterceptor('supportingDocuments', 3))
  @ApiBody({ type: CreateAutonomousServiceDto })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable',
  })
  async createAutonomousService(
    @Body() createAutonomousServiceDto: CreateAutonomousServiceDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.autonomousServiceService.createAutonomousService(
      createAutonomousServiceDto,
      req.user as User,
      files,
    );
  }
}
