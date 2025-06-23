import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EFinanceHistoryAction } from '../enums/finance-history-action.enum';
import { BaseEntity } from '@app/common/database/base.entity';
import { User } from '@core-service/modules/user/entities/user.entity';

@Entity()
export class FinanceHistory extends BaseEntity {
  @Column({ type: 'enum', enum: EFinanceHistoryAction })
  action: EFinanceHistoryAction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ type: 'jsonb' })
  previousValue: Record<string, any>;

  @Column({ type: 'jsonb' })
  newValue: Record<string, any>;
}
