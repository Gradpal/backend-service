import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { ApiQuery } from '@nestjs/swagger';
import { EUserRole } from '../user/enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTutorPortfolioDto } from './dto/create-tutor-portfolio.dto';
import { CreateStudentPortfolioDto } from './dto/create-student-portfolio.dto';
import { User } from '../user/entities/user.entity';
import { AuthUser } from '@core-service/decorators/auth.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('student')
  @ApiQuery({ name: 'role', type: 'enum', enum: EUserRole })
  @UseInterceptors(FileInterceptor('profilePicture'))
  @AuthUser()
  async create(
    @Body() createPortfolioDto: CreateStudentPortfolioDto,
    @Req() req,
  ) {
    return this.portfolioService.createStudentPortfolio(
      req.user as User,
      createPortfolioDto,
    );
  }

  @Post('tutor')
  @ApiQuery({ name: 'role', type: 'enum', enum: EUserRole })
  @UseInterceptors(FileInterceptor('profilePicture'))
  @AuthUser()
  async createTutorPortfolio(
    @Body() createPortfolioDto: CreateTutorPortfolioDto,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Req() req,
  ) {
    return this.portfolioService.createTutorPortfolio(
      req.user as User,
      createPortfolioDto,
    );
  }
}
