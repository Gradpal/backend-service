import { Injectable } from '@nestjs/common';
import { SubjectTier } from './entities/subject-tier.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateBulkSubjectTierDto,
  CreateSubjectTierDto,
  UpdateSubjectTierDto,
  AssignSubjectsDto,
  AssignBulkSubjectsDto,
} from './dto/create-subject-tier.entity';
import { Subject } from '../entities/subject.entity';
import { In } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';
import { ETierCategory } from './enums/tier-category.enum';

@Injectable()
export class SubjectTierService {
  constructor(
    @InjectRepository(SubjectTier)
    private readonly subjectTierRepository: Repository<SubjectTier>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  async createSubjectTier(
    portfolioId: string,
    createSubjectTierDto: CreateSubjectTierDto,
    loggedInUser: User,
  ): Promise<SubjectTier> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['subjectTiers', 'subjects'],
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const subjectTier = await this.subjectTierRepository.create({
      ...createSubjectTierDto,
      portfolio: { id: portfolioId },
    });
    await this.refreshTierSubjects(portfolio);
    return await this.subjectTierRepository.save(subjectTier);
  }

  async createBulkSubjectTier(
    portfolioId: string,
    createBulkSubjectTierDto: CreateBulkSubjectTierDto,
  ): Promise<SubjectTier[]> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const subjectTiers = this.subjectTierRepository.create(
      createBulkSubjectTierDto.subjectTiers.map((subjectTier) => ({
        ...subjectTier,
        tutor: { id: portfolio.id },
      })),
    );

    return this.subjectTierRepository.save(subjectTiers);
  }

  async findAllByPortfolioId(portfolioId: string): Promise<SubjectTier[]> {
    return this.subjectTierRepository.find({
      where: { portfolio: { id: portfolioId } },
      relations: ['subjects'],
    });
  }

  async findOneByPortfolioIdAndSubject(
    portfolioId: string,
    subject: string,
  ): Promise<SubjectTier> {
    return this.subjectTierRepository.findOne({
      where: { portfolio: { id: portfolioId }, subjects: { id: subject } },
    });
  }

  async updateSubjectTier(
    portfolioId: string,
    subject: string,
    updateSubjectTierDto: UpdateSubjectTierDto,
  ): Promise<SubjectTier> {
    const subjectTier = await this.findOneByPortfolioIdAndSubject(
      portfolioId,
      subject,
    );
    return this.subjectTierRepository.save({
      ...subjectTier,
      ...updateSubjectTierDto,
    });
  }
  async refreshTierSubjects(portfolio: Portfolio) {
    if (!portfolio?.subjects) {
      return;
    }

    const subjects = portfolio.subjects;
    //subjects not in tiers
    const subjectsNotInTiers = subjects.filter(
      (subject) =>
        !portfolio.subjectTiers?.some((tier) =>
          tier.subjects?.some((tierSubject) => tierSubject?.id === subject?.id),
        ),
    );

    if (subjectsNotInTiers.length > 0) {
      let basicTier = await this.subjectTierRepository.findOne({
        where: {
          category: ETierCategory.BASIC,
          portfolio: { id: portfolio.id },
        },
        relations: ['subjects'],
      });

      if (basicTier) {
        // Filter out subjects that are already in the tier
        const existingSubjectIds =
          basicTier.subjects?.map((s) => s?.id).filter(Boolean) || [];
        const newSubjects = subjectsNotInTiers.filter(
          (subject) => subject?.id && !existingSubjectIds.includes(subject.id),
        );

        if (newSubjects.length > 0) {
          basicTier.subjects = [...(basicTier.subjects || []), ...newSubjects];
          await this.subjectTierRepository.save(basicTier);
        }
      }
    }

    //check for subjects in tiers but not in portfolio subjects and remove them from tiers
    if (!portfolio.subjectTiers) {
      return;
    }

    const subjectsInTiers = portfolio.subjectTiers
      .flatMap((tier) => tier.subjects || [])
      .filter(Boolean);

    const subjectsNotInPortfolio = subjectsInTiers.filter(
      (subject) =>
        subject?.id && !portfolio.subjects?.some((s) => s?.id === subject.id),
    );

    if (subjectsNotInPortfolio.length > 0) {
      for (const subject of subjectsNotInPortfolio) {
        if (!subject?.id) continue;

        const tier = portfolio.subjectTiers.find((tier) =>
          tier.subjects?.some((s) => s?.id === subject.id),
        );
        if (tier) {
          // Get the tier with its subjects relation
          const tierWithSubjects = await this.subjectTierRepository.findOne({
            where: { id: tier.id },
            relations: ['subjects'],
          });

          if (tierWithSubjects) {
            // Filter out the subject to remove
            tierWithSubjects.subjects =
              tierWithSubjects.subjects?.filter((s) => s?.id !== subject.id) ||
              [];

            // Save the updated tier
            await this.subjectTierRepository.save(tierWithSubjects);
          }
        }
      }
    }
  }
  async updateSubjectTierById(
    id: string,
    updateSubjectTierDto: UpdateSubjectTierDto,
    loggedInUser: User,
  ): Promise<SubjectTier> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: loggedInUser.id } },
      relations: ['subjectTiers', 'subjects'],
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const subjectTier = await this.subjectTierRepository.findOne({
      where: { id },
      relations: ['subjects'],
    });

    if (!subjectTier) {
      throw new Error('Subject tier not found');
    }

    // Keep existing subjects when updating
    const existingSubjects = subjectTier.subjects || [];

    // Update the tier with new data while preserving subjects
    Object.assign(subjectTier, {
      ...updateSubjectTierDto,
      subjects: existingSubjects,
    });

    // If this is the BASIC tier, add any subjects not in other tiers
    if (updateSubjectTierDto.category === 'BASIC') {
      const subjectsNotInTiers = portfolio.subjects.filter(
        (subject) =>
          !portfolio.subjectTiers.some((tier) =>
            tier.subjects?.some((tierSubject) => tierSubject.id === subject.id),
          ),
      );

      if (subjectsNotInTiers.length > 0) {
        subjectTier.subjects = [...existingSubjects, ...subjectsNotInTiers];
      }
    }

    console.log(subjectTier, 'subject tier------>');

    return this.subjectTierRepository.save(subjectTier);
  }

  async assignSubjects(
    loggedInUser: User,
    assignSubjectsDto: AssignBulkSubjectsDto,
  ): Promise<SubjectTier> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: loggedInUser.id } },
      relations: ['subjectTiers'],
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    let updatedSubjectTier;

    for (const subjectTierDto of assignSubjectsDto.subjectTiers) {
      const [subjectTier, subjects] = await Promise.all([
        this.subjectTierRepository.findOne({
          where: {
            id: subjectTierDto.subjectTierId,
            portfolio: { id: portfolio.id },
          },
        }),
        this.subjectRepository.findBy({ id: In(subjectTierDto.subjectIds) }),
      ]);

      if (!subjectTier) {
        throw new Error('Subject tier not found');
      }

      subjectTier.subjects = subjects;
      updatedSubjectTier = await this.subjectTierRepository.save(subjectTier);
    }

    return updatedSubjectTier;
  }

  async findSubjectTierWhichHasSubjectByTutorId(
    tutorId: string,
    subjectId: string,
  ): Promise<SubjectTier> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new Error('Subject not found');
    }
    return this.subjectTierRepository.findOne({
      where: {
        portfolio: { user: { id: tutorId } },
        subjects: { id: subjectId },
      },
    });
  }
}
