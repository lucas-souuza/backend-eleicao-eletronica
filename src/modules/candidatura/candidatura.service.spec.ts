import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { CandidaturaService } from './candidatura.service';
import { Candidatura } from './entities/candidatura.entity';
import { Candidato } from '../candidato/entities/candidato.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Partido } from '../partido/entities/partido.entity';

describe('CandidaturaService', () => {
  const dto = {
    candidatoId: '1',
    eleicaoId: '2',
    cargoId: '4',
    partidoId: '5',
    numeroEleitoral: '45',
  };

  let service: CandidaturaService;
  let candidatoRepo: { findOneBy: jest.Mock };
  let eleicaoRepo: { findOne: jest.Mock };
  let cargoRepo: { findOneBy: jest.Mock };
  let partidoRepo: { findOneBy: jest.Mock };
  let candidaturaRepo: { create: jest.Mock; save: jest.Mock };

  const erroDeBanco = (constraint: string, code = '23505') =>
    new QueryFailedError('INSERT ...', [], {
      code,
      constraint,
    } as unknown as Error);

  const prepararCaminhoFeliz = () => {
    candidatoRepo.findOneBy.mockResolvedValue({ id: '1' });
    eleicaoRepo.findOne.mockResolvedValue({
      id: '2',
      situacao: { nome: 'AGENDADA' },
    });
    cargoRepo.findOneBy.mockResolvedValue({ id: '4' });
    partidoRepo.findOneBy.mockResolvedValue({ id: '5' });
  };

  beforeEach(() => {
    candidatoRepo = { findOneBy: jest.fn() };
    eleicaoRepo = { findOne: jest.fn() };
    cargoRepo = { findOneBy: jest.fn() };
    partidoRepo = { findOneBy: jest.fn() };
    candidaturaRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) =>
        Promise.resolve({ ...dados, id: '100' }),
      ),
    };

    const repositorios = new Map<unknown, unknown>([
      [Candidato, candidatoRepo],
      [Eleicao, eleicaoRepo],
      [Cargo, cargoRepo],
      [Partido, partidoRepo],
      [Candidatura, candidaturaRepo],
    ]);
    const manager = {
      getRepository: jest.fn((entidade: unknown) => repositorios.get(entidade)),
    };
    const dataSource = {
      transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)),
    };

    service = new CandidaturaService(dataSource as unknown as DataSource);
  });

  it('cadastra a candidatura e devolve os identificadores', async () => {
    prepararCaminhoFeliz();

    const resultado = await service.cadastrar(dto);

    expect(resultado).toEqual({
      id: '100',
      candidatoId: '1',
      eleicaoId: '2',
      cargoId: '4',
      partidoId: '5',
      numeroEleitoral: '45',
    });
    expect(candidaturaRepo.save).toHaveBeenCalledTimes(1);
  });

  it('lança NotFound quando o candidato não existe', async () => {
    candidatoRepo.findOneBy.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new NotFoundException('Candidato não encontrado.'),
    );
    expect(candidaturaRepo.save).not.toHaveBeenCalled();
  });

  it('lança NotFound quando a eleição não existe', async () => {
    prepararCaminhoFeliz();
    eleicaoRepo.findOne.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new NotFoundException('Eleição não encontrada.'),
    );
  });

  it.each(['ABERTA', 'ENCERRADA'])(
    'lança Conflict quando a eleição está %s (só AGENDADA aceita candidaturas)',
    async (situacao) => {
      prepararCaminhoFeliz();
      eleicaoRepo.findOne.mockResolvedValue({
        id: '2',
        situacao: { nome: situacao },
      });

      await expect(service.cadastrar(dto)).rejects.toThrow(
        new ConflictException(
          'Só é possível cadastrar candidaturas em eleições agendadas.',
        ),
      );
      expect(candidaturaRepo.save).not.toHaveBeenCalled();
    },
  );

  it('lança NotFound quando o cargo não existe', async () => {
    prepararCaminhoFeliz();
    cargoRepo.findOneBy.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new NotFoundException('Cargo não encontrado.'),
    );
  });

  it('lança NotFound quando o partido não existe', async () => {
    prepararCaminhoFeliz();
    partidoRepo.findOneBy.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new NotFoundException('Partido não encontrado.'),
    );
  });

  it('converte UQ_candidatura_candidato_eleicao em Conflict', async () => {
    prepararCaminhoFeliz();
    candidaturaRepo.save.mockRejectedValue(
      erroDeBanco('UQ_candidatura_candidato_eleicao'),
    );

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new ConflictException('Esse candidato já possui candidatura nesta eleição.'),
    );
  });

  it('converte UQ_candidatura_eleicao_cargo_numero em Conflict', async () => {
    prepararCaminhoFeliz();
    candidaturaRepo.save.mockRejectedValue(
      erroDeBanco('UQ_candidatura_eleicao_cargo_numero'),
    );

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new ConflictException(
        'Esse número eleitoral já está em uso para este cargo nesta eleição.',
      ),
    );
  });

  it('repassa erros de banco de outras constraints', async () => {
    prepararCaminhoFeliz();
    const erro = erroDeBanco('OUTRA_CONSTRAINT');
    candidaturaRepo.save.mockRejectedValue(erro);

    await expect(service.cadastrar(dto)).rejects.toBe(erro);
  });

  it('repassa erros inesperados', async () => {
    prepararCaminhoFeliz();
    const erro = new Error('banco fora do ar');
    candidaturaRepo.save.mockRejectedValue(erro);

    await expect(service.cadastrar(dto)).rejects.toBe(erro);
  });
});
