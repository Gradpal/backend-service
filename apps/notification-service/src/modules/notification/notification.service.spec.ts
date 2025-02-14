import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { Notification } from './entities/notification-registry.entity';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<NotificationService>(
      NotificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
