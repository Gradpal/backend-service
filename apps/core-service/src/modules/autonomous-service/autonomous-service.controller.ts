import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
  ApiQuery,
  ApiParam,
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

  @Get()
  @AuthUser()
  @ApiOperation({ summary: 'Get all autonomous services' })
  @ApiResponse({
    status: 200,
    description: 'The autonomous services have been successfully retrieved.',
  })
  @ApiQuery({
    name: 'searchKeyword',
    required: false,
    type: String,
    description: 'Search keyword',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page',
  })
  async getAllServices(
    @Query('searchKeyword') searchKeyword: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.autonomousServiceService.getAllServices(
      searchKeyword,
      limit,
      page,
    );
  }

  @Get(':id')
  @AuthUser()
  @ApiOperation({ summary: 'Get an autonomous service by ID' })
  @ApiResponse({
    status: 200,
    description: 'The autonomous service has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', description: 'Autonomous service ID' })
  async getAutonomousServiceById(@Param('id') id: string) {
    return this.autonomousServiceService.getAutonomousServiceById(id);
  }
}
