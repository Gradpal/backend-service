import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TimeSlot,
  WeeklyAvailability,
  DaySchedule,
} from './entities/weeky-availability.entity';
import { TimeSlotDto } from '../dto/update-portfolio-availability.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
@Injectable()
export class WeeklyAvailabilityService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(DaySchedule)
    private readonly dayScheduleRepository: Repository<DaySchedule>,
    @InjectRepository(WeeklyAvailability)
    private readonly weeklyAvailabilityRepository: Repository<WeeklyAvailability>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async findAllByUserId(userId: string): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({
      where: {
        owner: { id: userId },
      },
      relations: ['owner', 'daySchedule', 'daySchedule.weeklyAvailability'],
    });
  }

  async findOne(id: string): Promise<TimeSlot> {
    return this.timeSlotRepository.findOne({
      where: {
        id,
      },
      relations: ['owner', 'daySchedule', 'daySchedule.weeklyAvailability'],
    });
  }

  async findDaySchedule(dayScheduleId: string): Promise<DaySchedule> {
    const daySchedule = await this.dayScheduleRepository.findOne({
      where: {
        id: dayScheduleId,
      },
    });
    if (!daySchedule) {
      this.exceptionHandler.throwNotFound(_404.DAY_SCHEDULE_NOT_FOUND);
    }
    return daySchedule;
  }

  async addTimeSlotToDaySchedule(
    dayScheduleId: string,
    timeSlot: TimeSlotDto,
  ): Promise<TimeSlot> {
    const daySchedule = await this.findDaySchedule(dayScheduleId);

    const timeSlotEntity = new TimeSlot();
    timeSlotEntity.startTime = timeSlot.startTime;
    timeSlotEntity.endTime = timeSlot.endTime;
    timeSlotEntity.daySchedule = daySchedule;

    return this.timeSlotRepository.save(timeSlot);
  }
}
