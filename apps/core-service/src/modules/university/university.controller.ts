import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UniversityService } from './university.service';
import { CreateUniversityDto } from './dtos/create-university.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PreAuthorize } from '@core-service/decorators/auth.decorator';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';

@Controller('university')
@ApiTags('University')
@ApiBearerAuth()
@PreAuthorize(EUserRole.SUPER_ADMIN, EUserRole.TUTOR)
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Post() createUniversity(@Body() createUniversityDto: CreateUniversityDto) {
    return this.universityService.createUniversity(createUniversityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all universities' })
  @ApiResponse({
    status: 200,
    description: 'Return all universities',
  })
  @ApiResponse({ status: 404, description: 'Universities not found' })
  @ApiQuery({
    name: 'searchKeyword',
    type: String,
    required: false,
  })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({
    name: 'limit',
    type: Number,
    example: 10,
    required: false,
  })
  getUniversities(
    @Query('searchKeyword') searchKeyword?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.universityService.getUniversities(searchKeyword, page, limit);
  }

  @Get(':id') getUniversityById(@Param('id') id: string) {
    return this.universityService.getUniversityById(id);
  }

  @Put(':id') updateUniversity(
    @Param('id') id: string,
    @Body() updateUniversityDto: CreateUniversityDto,
  ) {
    return this.universityService.updateUniversity(id, updateUniversityDto);
  }

  @Delete(':id') deleteUniversity(@Param('id') id: string) {
    return this.universityService.deleteUniversity(id);
  }

  @Get('email-domain/:emailDomain') getUniversityByEmailDomain(
    @Param('emailDomain') emailDomain: string,
  ) {
    return this.universityService.getUniversityByEmailDomain(emailDomain);
  }

  @Get('university-name/:universityName') getUniversityByUniversityName(
    @Param('universityName') universityName: string,
  ) {
    return this.universityService.getUniversityByUniversityName(universityName);
  }

  @Get('country-name/:countryName') getUniversityByCountryName(
    @Param('countryName') countryName: string,
  ) {
    return this.universityService.getUniversityByCountryName(countryName);
  }

  @Get('university-name-and-country-name/:universityName/:countryName')
  getUniversityByUniversityNameAndCountryName(
    @Param('universityName') universityName: string,
    @Param('countryName') countryName: string,
  ) {
    return this.universityService.getUniversityByUniversityNameAndCountryName(
      universityName,
      countryName,
    );
  }
}
