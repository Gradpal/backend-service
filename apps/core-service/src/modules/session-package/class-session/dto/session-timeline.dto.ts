import { BaseDto } from '@core-service/common/dtos/all.dto';
import { SessionTimelineType } from '../enums/session-timeline-type.enum';
import { User } from '@core-service/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SessionTimelineDto extends BaseDto {
  @ApiProperty({
    description: 'The type of the timeline event',
    enum: SessionTimelineType,
  })
  type: SessionTimelineType;

  @ApiProperty({ description: 'The actor of the timeline event' })
  actor: User;
}
