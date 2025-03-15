import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Public()
  @ApiBody({
    type: CreateStudentDto,
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.studentService.create(createStudentDto, profilePicture);
  }

  @Get()
  async findAll(): Promise<Student[]> {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Student> {
    return this.studentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentService.remove(id);
  }
}
