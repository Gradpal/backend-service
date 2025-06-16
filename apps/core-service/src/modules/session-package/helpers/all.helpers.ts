import { timeStringToNextDate } from '@core-service/modules/class-session/helpers';
import { TimeSlot } from '@core-service/modules/portfolio/weekly-availability/entities/weeky-availability.entity';

export function calculateSessionStartTimeAndEndTimeBasedOnTimeSlots(
  timeSlots: TimeSlot[],
) {
  const startTime = timeSlots[0].startTime;
  const startDay =
    timeSlots[timeSlots.length - 1]?.daySchedule?.day ?? 'Monday';

  const endTime = timeSlots[timeSlots.length - 1].endTime;
  const endDay = timeSlots[timeSlots.length - 1]?.daySchedule?.day ?? 'Monday';

  return {
    startTime: timeStringToNextDate(`${startDay}:${startTime}`).toISOString(),
    endTime: timeStringToNextDate(`${endDay}:${endTime}`).toISOString(),
  };
}
