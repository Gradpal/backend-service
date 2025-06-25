import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { ApiProperty } from '@nestjs/swagger';
import { EComplaintRefundDecision } from '../enums/complaint-review.enum';
import { EComplaintReviewDecision } from '../enums/complaint-review.enum';
import { BaseDto } from '@core-service/common/dtos/all.dto';

export class SessionComplaintReviewDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  evidenceFiles: AttachmentDto[];
}

export class SessionComplaintReviwDecisionDto extends BaseDto {
  @ApiProperty({
    required: true,
    example: EComplaintReviewDecision.ACCEPTED,
  })
  decision: EComplaintReviewDecision;

  @ApiProperty({
    required: true,
    example: EComplaintRefundDecision.REFUND_DENIED,
  })
  refundDecision: EComplaintRefundDecision;

  @ApiProperty({
    required: false,
    example: null,
    description:
      'This is not required while making this request -- leave it null',
  })
  evidenceFiles: AttachmentDto[];
}
