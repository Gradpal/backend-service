import { Test, TestingModule } from '@nestjs/testing';
import { TutorService } from './tutor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tutor } from './entities/tutor.entity';

describe('TutorService', () => {
  let service: TutorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorService,
        {
          provide: getRepositoryToken(Tutor),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TutorService>(TutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
