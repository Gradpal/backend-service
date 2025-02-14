import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { Exclude } from 'class-transformer';
import { EGender } from '@app/common/enums';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ nullable: true }) // TODO: Change nullability to false  replacing the null values with actual ones in the database
  @ApiProperty()
  firstName: string;

  @Column({ nullable: true }) // TODO: Change nullability to false after replacing the null values with actual ones in the database
  @ApiProperty()
  lastName: string;

  @Column()
  @Index({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ nullable: true })
  @ApiProperty()
  @Exclude()
  password: string;
  @Column({ nullable: true })
  @ApiProperty()
  phoneNumber: string;

  @Column({ nullable: true }) // TODO: Change nullability to false after replacing the null values with actual ones in the database
  @ApiProperty()
  registrationID: string;

  @Column({ type: 'enum', enum: EGender, nullable: true }) // TODO: change This to  nullable=false
  @ApiProperty()
  gender: EGender;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.NOT_VERIFIED,
  })
  @ApiProperty()
  status: EUserStatus;

  @Column({ nullable: true })
  @ApiProperty()
  dateOfBirth: Date;
  @Column({ nullable: true })
  @ApiProperty()
  country: string;

  @Column({ type: 'enum', enum: EUserRole, nullable: false })
  @ApiProperty({ enum: EUserRole, example: EUserRole.STUDENT })
  role: EUserRole;
}
