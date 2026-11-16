import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturaController } from './candidatura.controller';

describe('CandidaturaController', () => {
  let controller: CandidaturaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidaturaController],
    }).compile();

    controller = module.get<CandidaturaController>(CandidaturaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
