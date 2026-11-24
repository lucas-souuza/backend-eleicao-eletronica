import { Test, TestingModule } from '@nestjs/testing';
import { InscricaoEleitorController } from './inscricao-eleitor.controller';
import { InscricaoEleitorService } from './inscricao-eleitor.service';

describe('InscricaoEleitorController', () => {
  let controller: InscricaoEleitorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscricaoEleitorController],
      providers: [
        {
          provide: InscricaoEleitorService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InscricaoEleitorController>(
      InscricaoEleitorController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
