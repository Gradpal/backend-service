import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dtos/create-subject.dto';
import { UpdatePortfolioSubjectsDto } from './dtos/update-portfolio-subjects.dto';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  async createSubject(subject: CreateSubjectDto) {
    const existingSubject = await this.subjectRepository.findOne({
      where: { name: subject.name },
    });
    if (existingSubject) {
      throw new ConflictException('Subject already exists');
    }
    const newSubject = this.subjectRepository.create(subject);
    return this.subjectRepository.save(newSubject);
  }

  async getSubjects() {
    return await this.subjectRepository.find({});
  }

  async getSubjectById(id: string) {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async updatePortfolioSubjects(
    user: User,
    updatePortfolioSubjectsDto: UpdatePortfolioSubjectsDto,
  ) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['subjects'],
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Get all subjects from the DTO
    const subjects = await Promise.all(
      updatePortfolioSubjectsDto.subjects.map(async (subjectDto) => {
        const subject = await this.subjectRepository.findOne({
          where: { id: subjectDto.id },
        });
        if (!subject) {
          throw new NotFoundException(
            `Subject with id ${subjectDto.id} not found`,
          );
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

    // Return the updated portfolio with subjects
    return this.portfolioRepository.findOne({
      where: { id: portfolio.id },
      relations: ['subjects'],
    });
  }
}
