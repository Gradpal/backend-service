import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NationalPortal } from './entities/national-portal.entity';
import { CreateNationalPortalDto } from './dtos/create-national-portal.dto';
import { UserService } from '@core-service/modules/user/user.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';
import { hashPassword } from '@core-service/common/helpers/all.helpers';
import { EPortalStatus } from './enums/portal-status.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(NationalPortal)
    private nationalPortalRepository: Repository<NationalPortal>,
    private readonly userService: UserService,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createNationalPortal(createNationalPortalDto: CreateNationalPortalDto) {
    const exists = await this.existsByCountryEmailOrName(
      createNationalPortalDto.countryEmail,
      createNationalPortalDto.countryName,
    );
    if (exists) {
      this.exceptionHandler.throwConflict(_409.NATIONAL_PORTAL_ALREADY_EXISTS);
    }
    let admin = await this.userService.getUserRepository().findOne({
      where: {
        email: createNationalPortalDto.countryEmail,
        role: EUserRole.NATIONAL_PORTAL_ADMIN,
      },
    });
    if (!admin) {
      const adminPassword = await hashPassword(
        createNationalPortalDto.countryEmail,
      );
      admin = await this.userService.getUserRepository().create({
        email: createNationalPortalDto.countryEmail,
        password: adminPassword,
        userName: createNationalPortalDto.countryEmail,
        role: EUserRole.NATIONAL_PORTAL_ADMIN,
      });
      admin = await this.userService.getUserRepository().save(admin);
    }

    const nationalPortal = this.nationalPortalRepository.create(
      createNationalPortalDto,
    );
    nationalPortal.admin = admin;
    return this.nationalPortalRepository.save(nationalPortal);
  }

  async existsByCountryEmailOrName(countryEmail: string, countryName: string) {
    const portal = await this.nationalPortalRepository.findOne({
      where: { countryEmail, countryName },
    });
    return !!portal;
  }
  async getAllNationalPortals(
    status: EPortalStatus,
    page: number,
    limit: number,
  ) {
    const query = this.nationalPortalRepository
      .createQueryBuilder('nationalPortal')
      .leftJoinAndSelect('nationalPortal.admin', 'admin')
      .select([
        'nationalPortal.id',
        'nationalPortal.countryName',
        'nationalPortal.countryEmail',
        'nationalPortal.createdAt',
        'nationalPortal.updatedAt',
        'nationalPortal.status',
        'admin.id',
        'admin.email',
        'admin.firstName',
        'admin.lastName',
        'admin.profilePicture',
        'admin.role',
        'admin.status',
      ]);
    if (status) {
      query.where('nationalPortal.status = :status', { status });
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    const [portals, total] = await query.getManyAndCount();
    return createPaginatedResponse(portals, total, page, limit);
  }
  async updateNationalPortal(
    id: string,
    updateNationalPortalDto: CreateNationalPortalDto,
  ) {
    const nationalPortal = await this.nationalPortalRepository.findOne({
      where: { id },
    });
    if (!nationalPortal) {
      this.exceptionHandler.throwNotFound(_404.NATIONAL_PORTAL_NOT_FOUND);
    }
    Object.assign(nationalPortal, updateNationalPortalDto);
    return this.nationalPortalRepository.save(nationalPortal);
  }

  async getNationalPortalById(id: string) {
    const nationalPortal = await this.nationalPortalRepository.findOne({
      where: { id },
      relations: ['admin'],
    });
    if (!nationalPortal) {
      this.exceptionHandler.throwNotFound(_404.NATIONAL_PORTAL_NOT_FOUND);
    }
    return nationalPortal;
  }

  async deleteNationalPortal(id: string) {
    const nationalPortal = await this.nationalPortalRepository.findOne({
      where: { id },
    });
    if (!nationalPortal) {
      this.exceptionHandler.throwNotFound(_404.NATIONAL_PORTAL_NOT_FOUND);
    }
    return this.nationalPortalRepository.softDelete(nationalPortal);
  }

  async activateOrDeactivateNationalPortal(id: string, status: EPortalStatus) {
    const nationalPortal = await this.getNationalPortalById(id);
    if (!nationalPortal) {
      this.exceptionHandler.throwNotFound(_404.NATIONAL_PORTAL_NOT_FOUND);
    }
    nationalPortal.status = status;
    return this.nationalPortalRepository.save(nationalPortal);
  }
}
