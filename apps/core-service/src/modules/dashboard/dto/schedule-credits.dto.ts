import { ClassSession } from '@core-service/modules/class-session/entities/class-session.entity';

export class StudentScheduleAndCreditsResponseDTO {
  credits: number;
  currentStreaks: string;
  bestStreak: string;
  schedules: ClassSession[];
}
