import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { SubjectTier } from './entities/subject-tier.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateBulkSubjectTierDto,
  UpdateSubjectTierDto,
  InitializeSubjectTierDto,
  MoveSubjectFromOneTierToAnotherDto,
  UpdateSubjectTiersPricesDto,
} from './dto/create-subject-tier.entity';
import { Subject } from '../entities/subject.entity';
import { In } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';
import { ETierCategory } from './enums/tier-category.enum';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { PortfolioService } from '@core-service/modules/portfolio/portfolio.service';
import { _403, _404 } from '@app/common/constants/errors-constants';
@Injectable()
export class SubjectTierService {
  constructor(
    @InjectRepository(SubjectTier)
    private readonly subjectTierRepository: Repository<SubjectTier>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly exceptionHandler: ExceptionHandler,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  getSubjectTierRepository() {
    return this.subjectTierRepository;
  }

  async initializeSubjectTiers(
    portfolioId: string,
    initializeSubjectTierDto: InitializeSubjectTierDto,
    loggedInUser: User,
  ): Promise<Portfolio> {
    const portfolio: Portfolio =
      await this.portfolioService.findOne(portfolioId);
    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.PORTFOLIO_NOT_FOUND);
    }
    if (portfolio.user.id !== loggedInUser.id) {
      this.exceptionHandler.throwForbidden(
        _403.UNAUTHORIZED_TO_UPDATE_PORTFOLIO,
      );
    }

    const currentSubjectTiers = portfolio.subjectTiers || [];

    for (const initialSubjectTier of initializeSubjectTierDto.subjectTiers) {
      const subjects = await this.subjectRepository.findBy({
        id: In(initialSubjectTier.subjectsIds),
      });
      const existingSubjectTier = currentSubjectTiers.find(
        (tier) => tier.category === initialSubjectTier.category,
      );
      if (existingSubjectTier) {
        existingSubjectTier.subjects = [
          ...(existingSubjectTier.subjects || []),
          ...subjects,
        ];
        existingSubjectTier.credits = initialSubjectTier.credits;
        await this.subjectTierRepository.save(existingSubjectTier);
      } else {
        const subjectTier = await this.subjectTierRepository.create({
          ...initialSubjectTier,
          portfolio: { id: portfolioId },
          subjects,
        });
        const newSubjectTier =
          await this.subjectTierRepository.save(subjectTier);
        currentSubjectTiers.push(newSubjectTier);
      }
    }
    portfolio.subjectTiers = currentSubjectTiers;
    return await this.portfolioService.getPortfolioRepository().save(portfolio);
  }

  async removeSubjectTier(portfolioId: string, subjectTierId: string) {
    const portfolio = await this.portfolioService.findOne(portfolioId);
    const subjectTier = await this.findOneByIdAndPortfolioId(
      subjectTierId,
      portfolio.id,
    );
    await this.subjectTierRepository.softDelete(subjectTier);
  }
  async moveSubjectFromOneTierToAnother(
    portfolioId: string,
    moveSubjectFromOneTierToAnotherDto: MoveSubjectFromOneTierToAnotherDto,
  ) {
    const originSubjectTier = await this.findOneByIdAndPortfolioId(
      moveSubjectFromOneTierToAnotherDto.originTierId,
      portfolioId,
    );
    const destinationSubjectTier = await this.findOneByIdAndPortfolioId(
      moveSubjectFromOneTierToAnotherDto.destinationTierId,
      portfolioId,
    );

    if (!originSubjectTier) {
      this.exceptionHandler.throwForbidden(
        _403.SUBJECT_TIER_NOT_BELONG_TO_PORTFOLIO,
      );
    }
    if (!destinationSubjectTier) {
      this.exceptionHandler.throwForbidden(
        _403.SUBJECT_TIER_NOT_BELONG_TO_PORTFOLIO,
      );
    }

    const subject = await this.subjectRepository.findOne({
      where: { id: moveSubjectFromOneTierToAnotherDto.subjectId },
    });
    if (!subject) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
    }
    const originSubjectTierSubjects = originSubjectTier.subjects || [];
    const destinationSubjectTierSubjects =
      destinationSubjectTier.subjects || [];

    originSubjectTier.subjects = originSubjectTierSubjects.filter(
      (s) => s.id !== subject.id,
    );
    destinationSubjectTierSubjects.push(subject);

    originSubjectTier.subjects = originSubjectTierSubjects;
    destinationSubjectTier.subjects = destinationSubjectTierSubjects;

    await Promise.all([
      this.subjectTierRepository.save(originSubjectTier),
      this.subjectTierRepository.save(destinationSubjectTier),
    ]);
  }

  async findOneByIdAndPortfolioId(
    subjectTierId: string,
    portfolioId: string,
  ): Promise<SubjectTier> {
    const subjectTier = await this.subjectTierRepository.findOne({
      where: { id: subjectTierId, portfolio: { id: portfolioId } },
    });
    if (!subjectTier) {
      this.exceptionHandler.throwForbidden(
        _403.SUBJECT_TIER_NOT_BELONG_TO_PORTFOLIO,
      );
    }
    return subjectTier;
  }

  async createBulkSubjectTier(
    portfolioId: string,
    createBulkSubjectTierDto: CreateBulkSubjectTierDto,
  ): Promise<SubjectTier[]> {
    const portfolio = await this.portfolioService.findOne(portfolioId);

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.PORTFOLIO_NOT_FOUND);
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
      relations: ['subjects'],
    });
  }

  async findByPortfolioIdAndCategory(
    portfolioId: string,
    category: ETierCategory,
  ): Promise<SubjectTier> {
    return this.subjectTierRepository.findOne({
      where: { portfolio: { id: portfolioId }, category },
      relations: ['subjects'],
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
      const basicTier = await this.subjectTierRepository.findOne({
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
    const portfolio = await this.portfolioService.findOne(loggedInUser.id);

    if (!portfolio) {
      this.exceptionHandler.throwNotFound(_404.PORTFOLIO_NOT_FOUND);
    }

    const subjectTier: SubjectTier = await this.subjectTierRepository.findOne({
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
    return this.subjectTierRepository.save(subjectTier);
  }

  async assignSubjectsToTiers(subjectId: string, subjecttierId: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });
    if (!subject) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
    }
    const subjectTier = await this.subjectTierRepository.findOne({
      where: { id: subjecttierId },
    });
    if (!subjectTier) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_TIER_NOT_FOUND);
    }
    subjectTier.subjects = [...(subjectTier.subjects || []), subject];
    return this.subjectTierRepository.save(subjectTier);
  }

  async findSubjectTierWhichHasSubjectByTutorId(
    tutorId: string,
    subjectId: string,
  ): Promise<SubjectTier> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });

    if (!subject) {
      this.exceptionHandler.throwNotFound(_404.SUBJECT_NOT_FOUND);
    }
    return this.subjectTierRepository.findOne({
      where: {
        portfolio: { user: { id: tutorId } },
        subjects: { id: subjectId },
      },
    });
  }
  async updateSubjectTierPrices(
    portfolioId: string,
    updateSubjectTiersPricesDto: UpdateSubjectTiersPricesDto,
  ) {
    for (const subjectTierDto of updateSubjectTiersPricesDto.subjectTiers) {
      const subjectTier = await this.subjectTierRepository.findOne({
        where: {
          id: subjectTierDto.subjectTierId,
          portfolio: { id: portfolioId },
        },
      });
      if (subjectTier) {
        subjectTier.credits = subjectTierDto.credits;
        await this.subjectTierRepository.save(subjectTier);
      }
    }
  }
}
