import { PartialUser } from '@core-service/modules/autonomous-service/dtos/partial-user.dto';

export class BookedTimeDto {
  startTime: string;
  endTime: string;
  bookedBy: PartialUser;
}
