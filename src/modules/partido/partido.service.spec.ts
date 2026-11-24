import { Test, TestingModule } from '@nestjs/testing';
import { PartidoService } from './partido.service';
import { Repository } from 'typeorm';
import { Partido } from './entities/partido.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PartidoService', () => {
  let service: PartidoService;

  let PartidoRepository: Repository<Partido>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartidoService,
        {
          provide: getRepositoryToken(Partido),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PartidoService>(PartidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
