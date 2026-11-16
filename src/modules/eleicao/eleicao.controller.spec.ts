import { Test, TestingModule } from '@nestjs/testing';
import { EleicaoController } from './eleicao.controller';

describe('EleicaoController', () => {
  let controller: EleicaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EleicaoController],
    }).compile();

    controller = module.get<EleicaoController>(EleicaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
