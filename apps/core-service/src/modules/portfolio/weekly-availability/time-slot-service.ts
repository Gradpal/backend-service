import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from './entities/weeky-availability.entity';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
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
}
