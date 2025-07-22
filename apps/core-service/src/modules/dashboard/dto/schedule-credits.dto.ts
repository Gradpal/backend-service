class TimeSlotDto {
  startTime: string;
  endTime: string;
  day: string;
  timezone: string;
  tutor: {
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
}

export class SessionScheduleDTO {
  id: string;
  status: string;
  subjectName: string;
  timeSlot: TimeSlotDto;
}

export class StudentScheduleAndCreditsResponseDTO {
  credits: number;
  currentStreaks: string;
  bestStreak: string;
  schedules: SessionScheduleDTO[];
}
