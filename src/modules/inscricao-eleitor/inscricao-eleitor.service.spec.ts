import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';

import { InscricaoEleitorService } from './inscricao-eleitor.service';
import { InscricaoEleitor } from './entities/inscricao-eleitor.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';

describe('InscricaoEleitorService', () => {
  const dto = { eleitorId: '3', eleicaoId: '1' };

  let service: InscricaoEleitorService;
  let inscricaoRepo: { create: jest.Mock; save: jest.Mock };
  let eleitorRepo: { findOneBy: jest.Mock };
  let eleicaoRepo: { findOne: jest.Mock };

  const prepararCaminhoFeliz = () => {
    eleitorRepo.findOneBy.mockResolvedValue({ id: '3' });
    eleicaoRepo.findOne.mockResolvedValue({
      id: '1',
      situacao: { nome: 'AGENDADA' },
    });
  };

  beforeEach(() => {
    inscricaoRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) =>
        Promise.resolve({
          ...dados,
          id: '50',
          inscritoEm: new Date('2026-01-01T00:00:00Z'),
        }),
      ),
    };
    eleitorRepo = { findOneBy: jest.fn() };
    eleicaoRepo = { findOne: jest.fn() };

    service = new InscricaoEleitorService(
      inscricaoRepo as unknown as Repository<InscricaoEleitor>,
      eleitorRepo as unknown as Repository<Eleitor>,
      eleicaoRepo as unknown as Repository<Eleicao>,
    );
  });

  it('inscreve o eleitor em uma eleição agendada', async () => {
    prepararCaminhoFeliz();

    const resultado = await service.inscrever(dto);

    expect(resultado).toEqual({
      id: '50',
      eleitorId: '3',
      eleicaoId: '1',
      inscritoEm: new Date('2026-01-01T00:00:00Z'),
    });
  });

  it('lança NotFound quando o eleitor não existe', async () => {
    eleitorRepo.findOneBy.mockResolvedValue(null);

    await expect(service.inscrever(dto)).rejects.toThrow(
      new NotFoundException('Eleitor não encontrado.'),
    );
    expect(inscricaoRepo.save).not.toHaveBeenCalled();
  });

  it('lança NotFound quando a eleição não existe', async () => {
    prepararCaminhoFeliz();
    eleicaoRepo.findOne.mockResolvedValue(null);

    await expect(service.inscrever(dto)).rejects.toThrow(
      new NotFoundException('Eleição não encontrada.'),
    );
  });

  it.each(['ABERTA', 'ENCERRADA'])(
    'lança Conflict quando a eleição está %s',
    async (situacao) => {
      prepararCaminhoFeliz();
      eleicaoRepo.findOne.mockResolvedValue({
        id: '1',
        situacao: { nome: situacao },
      });

      await expect(service.inscrever(dto)).rejects.toThrow(
        new ConflictException(
          'Só é possível inscrever eleitores em uma eleição agendada.',
        ),
      );
      expect(inscricaoRepo.save).not.toHaveBeenCalled();
    },
  );

  it('converte a violação UQ_inscricao_eleitor em Conflict', async () => {
    prepararCaminhoFeliz();
    inscricaoRepo.save.mockRejectedValue(
      new QueryFailedError('INSERT ...', [], {
        code: '23505',
        constraint: 'UQ_inscricao_eleitor',
      } as unknown as Error),
    );

    await expect(service.inscrever(dto)).rejects.toThrow(
      new ConflictException('Este eleitor já está inscrito em uma eleição.'),
    );
  });

  it('repassa erros de banco de outras constraints', async () => {
    prepararCaminhoFeliz();
    const erro = new QueryFailedError('INSERT ...', [], {
      code: '23505',
      constraint: 'OUTRA',
    } as unknown as Error);
    inscricaoRepo.save.mockRejectedValue(erro);

    await expect(service.inscrever(dto)).rejects.toBe(erro);
  });
});
