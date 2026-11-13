import { Test, TestingModule } from '@nestjs/testing';
import { InscricaoEleitorService } from './inscricao-eleitor.service';

describe('InscricaoEleitorService', () => {
  let service: InscricaoEleitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InscricaoEleitorService],
    }).compile();

    service = module.get<InscricaoEleitorService>(InscricaoEleitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
