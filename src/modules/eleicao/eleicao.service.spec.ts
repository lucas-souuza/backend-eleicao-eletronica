import { Test, TestingModule } from '@nestjs/testing';
import { EleicaoService } from './eleicao.service';

describe('EleicaoService', () => {
  let service: EleicaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EleicaoService],
    }).compile();

    service = module.get<EleicaoService>(EleicaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
