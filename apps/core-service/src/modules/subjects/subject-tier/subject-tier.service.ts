import { Injectable } from '@nestjs/common';
import { SubjectTier } from './entities/subject-tier.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateBulkSubjectTierDto,
  CreateSubjectTierDto,
  UpdateSubjectTierDto,
  AssignSubjectsDto,
} from './dto/create-subject-tier.entity';
import { Subject } from '../entities/subject.entity';
import { In } from 'typeorm';
import { User } from '@core-service/modules/user/entities/user.entity';
import { Portfolio } from '@core-service/modules/portfolio/entities/portfolio.entity';

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
  ): Promise<SubjectTier> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const subjectTier = this.subjectTierRepository.create({
      ...createSubjectTierDto,
      tutor: { id: portfolio.id },
    });
    return this.subjectTierRepository.save(subjectTier);
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
      where: { tutor: { id: portfolioId } },
    });
  }

  async findOneByPortfolioIdAndSubject(
    portfolioId: string,
    subject: string,
  ): Promise<SubjectTier> {
    return this.subjectTierRepository.findOne({
      where: { tutor: { id: portfolioId }, subjects: { id: subject } },
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

  async assignSubjects(
    loggedInUser: User,
    subjectTierId: string,
    assignSubjectsDto: AssignSubjectsDto,
  ): Promise<SubjectTier> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: loggedInUser.id } },
      relations: ['subjectTiers'],
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const [subjectTier, subjects] = await Promise.all([
      this.subjectTierRepository.findOne({
        where: {
          id: subjectTierId,
          tutor: { id: portfolio.id },
        },
        relations: ['subjects'],
      }),
      this.subjectRepository.findBy({ id: In(assignSubjectsDto.subjectIds) }),
    ]);

    if (!subjectTier) {
      throw new Error('Subject tier not found');
    }

    subjectTier.subjects = subjects;
    return this.subjectTierRepository.save(subjectTier);
  }
}
