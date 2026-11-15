import { Test, TestingModule } from '@nestjs/testing';
import { EleitorController } from './eleitor.controller';

describe('EleitorController', () => {
  let controller: EleitorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EleitorController],
    }).compile();

    controller = module.get<EleitorController>(EleitorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
