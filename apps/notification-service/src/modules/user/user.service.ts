import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DB_ROOT_NAMES } from '@notification-service/common/constants/typeorm-config.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { MessageOwner } from '@core-service/integrations/notification/interfaces/chat-service.interface';

@Injectable()
export class NotificationUserService {
  constructor(
    @InjectRepository(User, DB_ROOT_NAMES.CHAT)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    return user;
  }
  async userExists(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return !!user;
  }
  async createUser(user: MessageOwner) {
    if (await this.userExists(user.id)) {
      return this.getUserById(user.id);
    }
    const userEntity = this.userRepository.create({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePicture: user.profilePicture,
    });
    return this.userRepository.save(userEntity);
  }

  async getUsersByIds(ids: string[]) {
    return this.userRepository.find({ where: { id: In(ids) } });
  }
}
