import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import {
  CreateSubjectCategoryDto,
  CreateSubjectDto,
} from './dtos/create-subject.dto';
import { UpdatePortfolioSubjectsDto } from './dtos/update-portfolio-subjects.dto';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { User } from '../user/entities/user.entity';
import { SubjectTierService } from './subject-tier/subject-tier.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { SubjectCategory } from './entities/subject-category.entity';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(SubjectCategory)
    private readonly subjectCategoryRepository: Repository<SubjectCategory>,
    private readonly subjectTierService: SubjectTierService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createSubject(subject: CreateSubjectDto) {
    const [existingSubject, subjectCategory] = await Promise.all([
      this.subjectRepository.findOne({
        where: { name: subject.name },
      }),
      this.subjectCategoryRepository.findOne({
        where: { id: subject.categoryId },
      }),
    ]);
    if (existingSubject) {
      this.exceptionHandler.throwConflict(_409.SUBJECT_ALREADY_EXISTS);
    }
    const newSubject = this.subjectRepository.create({
      ...subject,
      category: subjectCategory,
    });
    return this.subjectRepository.save(newSubject);
  }

  async getSubjects() {
    return await this.subjectRepository.find({
      relations: ['category'],
    });
  }

  async getSubjectById(id: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!subject) this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
    return subject;
  }

  async getSubjectCategories(
    searchKey?: string,
    page?: number,
    limit?: number,
  ) {
    const queryBuilder = this.subjectCategoryRepository
      .createQueryBuilder('subjectCategory')
      .leftJoinAndSelect('subjectCategory.subjects', 'subjects');
    if (searchKey) {
      queryBuilder.where('subjectCategory.name ILIKE :searchKey', {
        searchKey: `%${searchKey}%`,
      });
    }
    if (page && limit) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
    const [subjectCategories, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(subjectCategories, total, page, limit);
  }

  async createSubjectCategory(subjectCategory: CreateSubjectCategoryDto) {
    const existingSubjectCategory =
      await this.subjectCategoryRepository.findOne({
        where: { name: subjectCategory.name },
      });
    if (existingSubjectCategory) {
      this.exceptionHandler.throwConflict(_409.SUBJECT_CATEGORY_ALREADY_EXISTS);
    }
    const newSubjectCategory =
      this.subjectCategoryRepository.create(subjectCategory);
    return this.subjectCategoryRepository.save(newSubjectCategory);
  }
  async getSubjectCategoryById(id: string) {
    const subjectCategory = await this.subjectCategoryRepository.findOne({
      where: { id: id },
    });
    if (!subjectCategory) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_CATEGORY_NOT_FOUND);
    }
    return subjectCategory;
  }

  async findOne(id: string) {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
    }
    return subject;
  }

  async updateSubjectCategory(
    id: string,
    updateSubjectCategoryDto: CreateSubjectCategoryDto,
  ) {
    const subjectCategory = await this.getSubjectCategoryById(id);
    subjectCategory.name = updateSubjectCategoryDto.name;
    subjectCategory.description = updateSubjectCategoryDto.description;
    return this.subjectCategoryRepository.save(subjectCategory);
  }
  async updateSubject(id: string, updateSubjectDto: CreateSubjectDto) {
    const subject = await this.getSubjectById(id);
    subject.name = updateSubjectDto.name;
    subject.category = await this.getSubjectCategoryById(
      updateSubjectDto.categoryId,
    );
    return this.subjectRepository.save(subject);
  }

  async deleteSubject(id: string) {
    const subject = await this.getSubjectById(id);
    return this.subjectRepository.softDelete(subject);
  }

  async deleteSubjectCategory(id: string) {
    const subjectCategory = await this.getSubjectCategoryById(id);
    return this.subjectCategoryRepository.softDelete(subjectCategory);
  }

  async updatePortfolioSubjects(
    user: User,
    subjectId: string,
    updatePortfolioSubjectsDto: UpdatePortfolioSubjectsDto,
  ) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['subjects', 'subjectTiers'],
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Get all subjects from the DTO
    const subjects = await Promise.all(
      updatePortfolioSubjectsDto.subjects.map(async (subjectDto) => {
        const subject = await this.subjectRepository.findOne({
          where: { id: subjectId },
        });
        if (!subject) {
          this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
        }
        return subject;
      }),
    );

    // Get current subject IDs in the portfolio
    const currentSubjectIds = portfolio.subjects?.map((s) => s.id) || [];
    const newSubjectIds = subjects.map((s) => s.id);

    // Find subjects to add (in newSubjectIds but not in currentSubjectIds)
    const subjectsToAdd = subjects.filter(
      (subject) => !currentSubjectIds.includes(subject.id),
    );

    // Find subjects to remove (in currentSubjectIds but not in newSubjectIds)
    const subjectsToRemove =
      portfolio.subjects?.filter(
        (subject) => !newSubjectIds.includes(subject.id),
      ) || [];

    // Update portfolio subjects
    if (subjectsToAdd.length > 0 || subjectsToRemove.length > 0) {
      // Remove subjects that are no longer needed
      if (subjectsToRemove.length > 0) {
        portfolio.subjects = portfolio.subjects?.filter(
          (subject) => !subjectsToRemove.some((s) => s.id === subject.id),
        );
      }

      // Add new subjects
      if (subjectsToAdd.length > 0) {
        // Verify each subject doesn't already exist in the join table
        const existingSubjects = await this.portfolioRepository
          .createQueryBuilder('portfolio')
          .innerJoin('portfolio.subjects', 'subject')
          .where('portfolio.id = :portfolioId', { portfolioId: portfolio.id })
          .andWhere('subject.id IN (:...subjectIds)', {
            subjectIds: subjectsToAdd.map((s) => s.id),
          })
          .getOne();

        const existingSubjectIds =
          existingSubjects?.subjects?.map((s) => s.id) || [];
        const verifiedSubjectsToAdd = subjectsToAdd.filter(
          (subject) => !existingSubjectIds.includes(subject.id),
        );

        if (verifiedSubjectsToAdd.length > 0) {
          // Keep existing subjects and add new ones
          portfolio.subjects = [
            ...(portfolio.subjects || []),
            ...verifiedSubjectsToAdd,
          ];
        }
      }

      // Save with reload option to properly handle the many-to-many relationship
      await this.portfolioRepository.save(portfolio, { reload: true });
    }

    await this.subjectTierService.refreshTierSubjects(portfolio);

    // Return the updated portfolio with subjects
    return this.portfolioRepository.findOne({
      where: { id: portfolio.id },
      relations: ['subjects'],
    });
  }
}
