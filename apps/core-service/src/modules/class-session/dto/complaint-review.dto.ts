import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { ApiProperty } from '@nestjs/swagger';
import { EComplaintRefundDecision } from '../enums/complaint-review.enum';
import { EComplaintReviewDecision } from '../enums/complaint-review.enum';
import { BaseDto } from '@core-service/common/dtos/all.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SessionComplaintReviewDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  evidenceFiles: AttachmentDto[];
}

export class SessionComplaintReviwDecisionDto extends BaseDto {
  @IsNotEmpty()
  @IsEnum(EComplaintReviewDecision)
  @ApiProperty({
    required: true,
    example: EComplaintReviewDecision.ACCEPTED,
  })
  decision: EComplaintReviewDecision;

  @IsNotEmpty()
  @IsEnum(EComplaintRefundDecision)
  @ApiProperty({
    required: true,
    enum: EComplaintRefundDecision,
  })
  refundDecision: EComplaintRefundDecision;

  @ApiProperty({ type: [AttachmentDto], required: false })
  evidenceFiles?: AttachmentDto[];
}
