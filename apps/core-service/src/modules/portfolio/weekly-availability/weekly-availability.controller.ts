import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WeeklyAvailabilityService } from './weekly-availability';
import { TimeSlotDto } from '../dto/update-portfolio-availability.dto';

@Controller('weekly-availability')
export class WeeklyAvailabilityController {
  constructor(
    private readonly weeklyAvailabilityService: WeeklyAvailabilityService,
  ) {}

  @Get('/user/:userId')
  findAllByUserId(@Param('userId') userId: string) {
    return this.weeklyAvailabilityService.findAllByUserId(userId);
  }

  @Post('/day-schedule/:id/add-time-slot')
  addTimeSlotToDaySchedule(
    @Param('id') id: string,
    @Body() timeSlot: TimeSlotDto,
  ) {
    return this.weeklyAvailabilityService.addTimeSlotToDaySchedule(
      id,
      timeSlot,
    );
  }
}
