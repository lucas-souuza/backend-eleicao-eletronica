import { Test, TestingModule } from '@nestjs/testing';
import { EleitorController } from './eleitor.controller';
import { EleitorService } from './eleitor.service';

describe('EleitorController', () => {
  let controller: EleitorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EleitorController],
      providers: [
        {
          provide: EleitorService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EleitorController>(EleitorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
