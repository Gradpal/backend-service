import { BaseEntity } from '@app/common/database/base.entity';
import { Column, Entity } from 'typeorm';
import { ELegalDocumentStatus } from '../enums/legal-document-status.enum';
import { ELegalDocumentType } from '../enums/legal-document-type.enum';

@Entity()
export class LegalDocument extends BaseEntity {
  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ELegalDocumentStatus,
    default: ELegalDocumentStatus.DRAFT,
  })
  status: ELegalDocumentStatus;

  @Column({
    type: 'enum',
    enum: ELegalDocumentType,
    default: ELegalDocumentType.TERMS_AND_CONDITIONS,
  })
  type: ELegalDocumentType;

  @Column({ type: 'jsonb', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  draftContent: string;
}
