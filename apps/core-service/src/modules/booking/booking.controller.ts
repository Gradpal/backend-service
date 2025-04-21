import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { BookingRequestDto } from './dto/booking-request.dto';
import { SessionDetailsDto } from './dto/session-details.dto';
import { Booking, BookingStatus } from './entities/booking.entity';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from '../user/enums/user-role.enum';

@ApiTags('Bookings')
@Controller('bookings')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @PreAuthorize(EUserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new booking request' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: Booking })
  @UseInterceptors(FileInterceptor('materials'))
  @AuthUser()
  async createBooking(
    @Req() req,
    @Body() bookingRequestDto: BookingRequestDto,
    @UploadedFile() materials?: Express.Multer.File,
  ): Promise<Booking> {
    return this.bookingService.createBooking(
      req.user as User,
      bookingRequestDto,
      materials,
    );
  }

  @Get('student')
  @PreAuthorize(EUserRole.STUDENT)
  @ApiOperation({ summary: 'Get all bookings for the current student' })
  @ApiResponse({ status: 200, type: [Booking] })
  @AuthUser()
  async getStudentBookings(@Req() req): Promise<Booking[]> {
    const student = req.user as User;
    return this.bookingService.getStudentBookings(student.id);
  }

  @Get('tutor')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Get all bookings for the current tutor' })
  @ApiResponse({ status: 200, type: [Booking] })
  async getTutorBookings(@Req() req): Promise<Booking[]> {
    const tutor = req.user as User;
    return this.bookingService.getTutorBookings(tutor.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: SessionDetailsDto })
  async getSessionDetails(@Param('id') id: string): Promise<SessionDetailsDto> {
    return this.bookingService.getSessionDetails(id);
  }

  @Put(':id/status')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({ status: 200, type: Booking })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Req() req,
  ): Promise<Booking> {
    return this.bookingService.updateBookingStatus(
      id,
      status,
      req.user as User,
    );
  }
}
