import { Test, TestingModule } from '@nestjs/testing';
import { EleicaoController } from './eleicao.controller';
import { EleicaoService } from './eleicao.service';

describe('EleicaoController', () => {
  let controller: EleicaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EleicaoController],
      providers: [
        {
          provide: EleicaoService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EleicaoController>(EleicaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
