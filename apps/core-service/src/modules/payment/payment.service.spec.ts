import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Student } from '../student/entities/student.entity';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { MINIO_PROPERTIES_MOCK } from '@core-service/common/mocks/all.mocks';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {},
        },
        {
          provide: CoreServiceConfigService,
          useValue: MINIO_PROPERTIES_MOCK,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
