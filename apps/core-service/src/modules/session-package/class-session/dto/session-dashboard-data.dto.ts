import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDTO {
  @ApiProperty({ example: 'a1b2c3', description: 'Session ID' })
  id: string;

  @ApiProperty({
    example: 'Mathematics',
    description: 'Subject name of the session',
  })
  subjectName: string;

  @ApiProperty({
    example: '2025-07-01T10:00:00.000Z',
    description: 'Session start time',
  })
  startTime: string;

  @ApiProperty({
    example: '2025-07-01T11:00:00.000Z',
    description: 'Session end time',
  })
  endTime: string;

  @ApiProperty({ example: '1h 0m', description: 'Session duration' })
  duration: string;
}

class TeacherInfoDTO {
  @ApiProperty({ example: 'uuid-123-teacher', description: 'Teacher ID' })
  id: string;

  @ApiProperty({ example: 'Jane', description: 'First name of the teacher' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the teacher' })
  lastName: string;
}

export class FeedbackResponseDTO {
  @ApiProperty({ example: 'uuid-session-1', description: 'ID of the session' })
  sessionId: string;

  @ApiProperty({
    example: 'English',
    required: false,
    description: 'Subject name',
  })
  subjectName?: string;

  @ApiProperty({ example: 'Great progress!', description: 'Feedback review' })
  review: string;

  @ApiProperty({
    example: 4.5,
    required: false,
    description: 'Rating given by the teacher',
  })
  rating?: number;

  @ApiProperty({
    example: '2025-07-10T15:30:00.000Z',
    required: false,
    description: 'Date when the session was reviewed',
  })
  reviewedAt?: Date;

  @ApiProperty({ type: TeacherInfoDTO, description: 'Details of the teacher' })
  teacher: TeacherInfoDTO;
}

export class SessionDashboardDataDTO {
  @ApiProperty({
    example: '5h 30m',
    description: 'Total hours spent in sessions',
  })
  totalHours: string;

  @ApiProperty({
    example: 12,
    description: 'Total number of completed sessions',
  })
  completedSessions: number;

  @ApiProperty({
    type: [SessionResponseDTO],
    description: 'List of recent sessions',
  })
  recentSessions: SessionResponseDTO[];

  @ApiProperty({
    type: [FeedbackResponseDTO],
    description: 'List of feedback provided by teachers',
  })
  feedbacks: FeedbackResponseDTO[];

  @ApiProperty({
    example: 85,
    description: 'Score for time management (0-100)',
  })
  timeManagement: number;

  @ApiProperty({ example: 92, description: 'Attendance rate (0-100)' })
  attendanceRate: number;
}
