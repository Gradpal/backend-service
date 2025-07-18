import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AutonomousService } from './autonomous-service.entity';
import { EBidStatus } from '../enums/bid-status.enum';
import { Invitation } from './invitation.entity';

@Entity({ name: 'bid' })
export class Bid extends BaseEntity {
  @ManyToOne(
    () => AutonomousService,
    (autonomousService) => autonomousService.bids,
    { nullable: true },
  )
  @JoinColumn({ name: 'autonomous_service_id' })
  autonomousService: AutonomousService;

  @Column()
  bidAmount: number;

  @Column({ nullable: true })
  teacherCounterbidAmount: number;

  @Column({ nullable: true })
  studentCounterbidAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EBidStatus,
    default: EBidStatus.PENDING,
  })
  status: EBidStatus;

  @OneToOne(() => Invitation, { nullable: true })
  @JoinColumn({ name: 'invitation_id' })
  invitation: Invitation;
}
