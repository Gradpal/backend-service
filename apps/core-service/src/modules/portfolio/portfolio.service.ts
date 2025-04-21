import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { UserService } from '../user/user.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _409 } from '@app/common/constants/errors-constants';
import { plainToClass } from 'class-transformer';
import { BrainService } from '@app/common/brain/brain.service';
import { User } from '../user/entities/user.entity';
import { CreateTutorPortfolioDto } from './dto/create-tutor-portfolio.dto';
import { CreateStudentPortfolioDto } from './dto/create-student-portfolio.dto';
import { Institution } from './entities/institution.entity';
import { EducationRecord } from './entities/education-record.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    @InjectRepository(EducationRecord)
    private readonly educationRecordRepository: Repository<EducationRecord>,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
  ) {}

  async createStudentPortfolio(
    user: User,
    portfolioDto: CreateStudentPortfolioDto,
  ) {
    const [profileExists] = await Promise.all([this.findByOnwer(user)]);
    if (profileExists) {
      this.exceptionHandler.throwConflict(_409.PROFILE_ALREADY_EXISTS);
    }
    const portfolio: Portfolio = this.portfolioRepository.create(portfolioDto);
    await this.portfolioRepository.save(portfolio);
    return plainToClass(Portfolio, portfolio);
  }

  async createTutorPortfolio(
    user: User,
    portfolioDto: CreateTutorPortfolioDto,
  ) {
    const [profileExists] = await Promise.all([this.findByOnwer(user)]);
    if (profileExists) {
      this.exceptionHandler.throwConflict(_409.USER_ALREADY_EXISTS);
    }
    const portfolio = this.portfolioRepository.create();
    if (portfolioDto.educationRecords) {
      const portfolioEducationRecords: EducationRecord[] = [];
      for (const educationRecord of portfolioDto.educationRecords) {
        const availableInstitution = await this.institutionRepository.findOne({
          where: {
            name: educationRecord.institutionName,
          },
        });

        let educationRecordEntity =
          this.educationRecordRepository.create(educationRecord);

        if (availableInstitution) {
          educationRecordEntity.institution = availableInstitution;
        } else {
          let newInstitution = this.institutionRepository.create({
            name: educationRecord.institutionName,
          });
          newInstitution =
            await this.institutionRepository.save(newInstitution);
          educationRecordEntity.institution = newInstitution;
        }
        educationRecordEntity = await this.educationRecordRepository.save(
          educationRecordEntity,
        );
        portfolioEducationRecords.push(educationRecordEntity);
      }
      portfolio.educationRecords = portfolioEducationRecords;
    }
    await this.portfolioRepository.save(portfolio);
    return plainToClass(Portfolio, portfolio);
  }

  async findByOnwer(user: User) {
    const portfolio = await this.portfolioRepository.findOne({
      where: {
        owner: { id: user.id },
      },
    });

    return portfolio;
  }
  async save(portfolio: Portfolio) {
    return await this.portfolioRepository.save(portfolio);
  }
}
