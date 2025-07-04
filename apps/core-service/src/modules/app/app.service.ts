import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocument } from './entities/legal-document.entity';
import { CreateLegalDocumentDto } from './dtos/create-legal-document.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { ELegalDocumentStatus } from './enums/legal-document-status.enum';
import { ELegalDocumentType } from './enums/legal-document-type.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(LegalDocument)
    private readonly legalDocumentRepository: Repository<LegalDocument>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createLegalDocument(createLegalDocumentDto: CreateLegalDocumentDto) {
    const legalDocument = this.legalDocumentRepository.create(
      createLegalDocumentDto,
    );
    return this.legalDocumentRepository.save(legalDocument);
  }

  async updateLegalDocument(
    id: string,
    updateLegalDocumentDto: CreateLegalDocumentDto,
  ) {
    const legalDocument = await this.getLegalDocument(id);
    legalDocument.title = updateLegalDocumentDto.title;
    legalDocument.draftContent = updateLegalDocumentDto.content;
    return await this.legalDocumentRepository.save(legalDocument);
  }

  async updateLegalDocumentTitle(
    id: string,
    updateLegalDocumentDto: CreateLegalDocumentDto,
  ) {
    const legalDocument = await this.getLegalDocument(id);
    legalDocument.title = updateLegalDocumentDto.title;
    return await this.legalDocumentRepository.save(legalDocument);
  }

  async getLegalDocument(id: string) {
    const legalDocument = await this.legalDocumentRepository.findOne({
      where: { id },
    });
    if (!legalDocument) {
      throw this.exceptionHandler.throwNotFound(_404.LEGAL_DOCUMENT_NOT_FOUND);
    }
    return legalDocument;
  }

  async publishLegalDocument(id: string) {
    const legalDocument = await this.getLegalDocument(id);
    legalDocument.status = ELegalDocumentStatus.PUBLISHED;
    legalDocument.content = legalDocument.draftContent;
    return await this.legalDocumentRepository.save(legalDocument);
  }

  async getLegalDocuments(
    status?: ELegalDocumentStatus,
    searchKey?: string,
    type?: ELegalDocumentType,
  ) {
    console.log('Reaching the service layer');
    const queryBuilder =
      this.legalDocumentRepository.createQueryBuilder('legalDocument');
    if (status) {
      queryBuilder.where('legalDocument.status = :status', { status });
    }
    if (searchKey) {
      queryBuilder.where(
        'legalDocument.title ILIKE :searchKey OR legalDocument.content ILIKE :searchKey',
        {
          searchKey: `%${searchKey}%`,
        },
      );
    }
    if (type) {
      queryBuilder.where('legalDocument.type = :type', { type });
    }
    return await queryBuilder.getMany();
  }
}
