import { ClassSession } from '@core-service/modules/session-package/class-session/entities/class-session.entity';

export class StudentScheduleAndCreditsResponseDTO {
  credits: number;
  currentStreaks: string;
  bestStreak: string;
  schedules: ClassSession[];
}
