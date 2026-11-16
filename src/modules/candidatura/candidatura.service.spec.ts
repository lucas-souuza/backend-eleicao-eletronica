import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturaService } from './candidatura.service';

describe('CandidaturaService', () => {
  let service: CandidaturaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidaturaService],
    }).compile();

    service = module.get<CandidaturaService>(CandidaturaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
