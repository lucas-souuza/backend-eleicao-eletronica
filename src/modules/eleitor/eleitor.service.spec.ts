import { Test, TestingModule } from '@nestjs/testing';
import { EleitorService } from './eleitor.service';

describe('EleitorService', () => {
  let service: EleitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EleitorService],
    }).compile();

    service = module.get<EleitorService>(EleitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
