import { Test, TestingModule } from '@nestjs/testing';
import { InscricaoEleitorController } from './inscricao-eleitor.controller';

describe('InscricaoEleitorController', () => {
  let controller: InscricaoEleitorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscricaoEleitorController],
    }).compile();

    controller = module.get<InscricaoEleitorController>(InscricaoEleitorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
