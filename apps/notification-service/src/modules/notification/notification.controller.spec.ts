import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification-registry.entity';

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {}
        },
        {
          provide: NotificationService,
          useValue: {}
        },
        {
          provide: ExceptionHandler,
          useValue: {}
        }
      ],
    }).compile();

    controller = module.get<NotificationController>(
      NotificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});



