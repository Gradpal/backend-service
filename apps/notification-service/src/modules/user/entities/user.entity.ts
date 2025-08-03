import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @IsString()
  @ApiProperty({
    description: 'The first name of the message owner',
  })
  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @IsString()
  @ApiProperty({
    description: 'The last name of the message owner',
  })
  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @IsString()
  @ApiProperty({
    description: 'The role of the message owner',
  })
  @Column({ type: 'varchar', nullable: true })
  role: string;

  @IsString()
  @ApiProperty({
    description: 'The profile picture of the message owner',
  })
  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;
}
