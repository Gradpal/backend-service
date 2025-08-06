import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { University } from './entities/university.entity';
import { CreateUniversityDto } from './dtos/create-university.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _409 } from '@app/common/constants/errors-constants';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';

@Injectable()
export class UniversityService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createUniversity(createUniversityDto: CreateUniversityDto) {
    const existingUniversity = await this.existsByDomainOrNameOrCountry(
      createUniversityDto.universityName,
      createUniversityDto.countryName,
      createUniversityDto.universityEmailDomain,
    );
    if (existingUniversity) {
      this.exceptionHandler.throwConflict(_409.UNIVERSITY_ALREADY_EXISTS);
    }
    const university = this.universityRepository.create(createUniversityDto);
    return this.universityRepository.save(university);
  }

  async getUniversities(searchKeyword?: string, page?: number, limit?: number) {
    const query = this.universityRepository
      .createQueryBuilder('university')
      .where('university.deletedAt IS NULL');
    if (searchKeyword) {
      query.where('university.university_name ILIKE :searchKeyword', {
        searchKeyword: `%${searchKeyword}%`,
      });
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    const [universities, total] = await query.getManyAndCount();
    return createPaginatedResponse(universities, total, page, limit);
  }

  async getUniversityById(id: string) {
    return this.universityRepository.findOne({ where: { id } });
  }

  async updateUniversity(id: string, updateUniversityDto: CreateUniversityDto) {
    const university = await this.getUniversityById(id);
    university.universityName = updateUniversityDto.universityName;
    university.countryName = updateUniversityDto.countryName;
    university.universityEmailDomains = [
      ...university.universityEmailDomains,
      updateUniversityDto.universityEmailDomain,
    ];

    return this.universityRepository.save(university);
  }

  async deleteUniversity(id: string) {
    return this.universityRepository.softDelete(id);
  }

  async getUniversityByEmailDomain(emailDomain: string) {
    return this.universityRepository.findOne({
      where: {
        universityEmailDomains: Raw(
          (alias) => `'${emailDomain}' = ANY (${alias})`,
        ),
      },
    });
  }

  async getUniversityByUniversityName(universityName: string) {
    return this.universityRepository.findOne({
      where: { universityName },
    });
  }

  async getUniversityByCountryName(countryName: string) {
    return this.universityRepository.findOne({
      where: { countryName },
    });
  }

  async getUniversityByUniversityNameAndCountryName(
    universityName: string,
    countryName: string,
  ) {
    return this.universityRepository.findOne({
      where: { universityName, countryName },
    });
  }

  async existsByDomainOrNameOrCountry(
    universityName: string,
    countryName: string,
    universityEmailDomains: string,
  ): Promise<boolean> {
    const university = await this.universityRepository.findOne({
      where: { universityName, countryName, universityEmailDomains },
    });
    return university !== null;
  }
}
