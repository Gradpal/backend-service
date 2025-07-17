import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AutonomousService } from './autonomous-service.entity';
import { EInvitationStatus } from '../enums/invitation-status.enum';
import { User } from '@core-service/modules/user/entities/user.entity';
import { BaseEntity } from '@app/common/database/base.entity';

@Entity()
export class Invitation extends BaseEntity {
  @ManyToOne(
    () => AutonomousService,
    (autonomousService) => autonomousService.invitations,
    { nullable: true },
  )
  @JoinColumn({ name: 'autonomous_service_id' })
  autonomousService: AutonomousService;

  @Column({
    type: 'enum',
    enum: EInvitationStatus,
    default: EInvitationStatus.INITIATED,
  })
  status: EInvitationStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;
}
