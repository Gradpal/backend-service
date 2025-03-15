import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { BrainService } from '@app/common/brain/brain.service';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { MINIO_PROPERTIES_MOCK } from '@core-service/common/mocks/all.mocks';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import Redis from 'ioredis';
import { BrainConfigService } from '@app/common/brain/brain-config.service';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        ExceptionHandler,
        UserService,
        BrainService,
        MinioClientService,
        BrainConfigService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {}, // Mock Redis connection
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {},
        },
        {
          provide: NotificationPreProcessor,
          useValue: {},
        },
        {
          provide: CoreServiceConfigService,
          useValue: MINIO_PROPERTIES_MOCK,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
