import { Test, TestingModule } from '@nestjs/testing';
import { CandidatoController } from './candidato.controller';

describe('CandidatoController', () => {
  let controller: CandidatoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatoController],
    }).compile();

    controller = module.get<CandidatoController>(CandidatoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
