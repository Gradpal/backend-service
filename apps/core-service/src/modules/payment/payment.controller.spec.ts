import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Student } from '../student/entities/student.entity';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { MINIO_PROPERTIES_MOCK } from '@core-service/common/mocks/all.mocks';

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
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

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
