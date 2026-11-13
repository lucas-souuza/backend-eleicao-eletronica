import { Test, TestingModule } from '@nestjs/testing';
import { ControleVotacaoService } from './controle-votacao.service';

describe('ControleVotacaoService', () => {
  let service: ControleVotacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControleVotacaoService],
    }).compile();

    service = module.get<ControleVotacaoService>(ControleVotacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
