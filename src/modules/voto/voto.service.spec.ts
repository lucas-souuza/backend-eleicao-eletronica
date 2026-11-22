import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { VotoService } from './voto.service';
import { Voto } from './entities/voto.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { InscricaoEleitor } from '../inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { ControleVotacao } from '../controle-votacao/entities/controle-votacao.entity';

const criarRepositorio = () => ({
  findOne: jest.fn(),
  create: jest.fn((dados: unknown) => dados),
  save: jest.fn((dados: unknown) => Promise.resolve(dados)),
});

describe('VotoService', () => {
  const dto = { eleicaoId: '1', cargoId: '4', candidaturaId: '10' };
  const usuarioId = '7';

  let service: VotoService;
  let eleitorRepo: ReturnType<typeof criarRepositorio>;
  let eleicaoRepo: ReturnType<typeof criarRepositorio>;
  let inscricaoRepo: ReturnType<typeof criarRepositorio>;
  let candidaturaRepo: ReturnType<typeof criarRepositorio>;
  let controleRepo: ReturnType<typeof criarRepositorio>;
  let votoRepo: ReturnType<typeof criarRepositorio>;

  const erroDeBanco = (code: string, constraint?: string) =>
    new QueryFailedError('INSERT ...', [], {
      code,
      constraint,
    } as unknown as Error);

  // Configura o "caminho feliz": todas as verificações passam.
  const prepararCaminhoFeliz = () => {
    eleitorRepo.findOne.mockResolvedValue({ id: '3' });
    eleicaoRepo.findOne.mockResolvedValue({
      id: '1',
      situacao: { nome: 'ABERTA' },
    });
    inscricaoRepo.findOne.mockResolvedValue({ id: '5' });
    candidaturaRepo.findOne.mockResolvedValue({ id: '10' });
  };

  beforeEach(() => {
    eleitorRepo = criarRepositorio();
    eleicaoRepo = criarRepositorio();
    inscricaoRepo = criarRepositorio();
    candidaturaRepo = criarRepositorio();
    controleRepo = criarRepositorio();
    votoRepo = criarRepositorio();

    const repositorios = new Map<unknown, unknown>([
      [Eleitor, eleitorRepo],
      [Eleicao, eleicaoRepo],
      [InscricaoEleitor, inscricaoRepo],
      [Candidatura, candidaturaRepo],
      [ControleVotacao, controleRepo],
      [Voto, votoRepo],
    ]);

    const manager = {
      getRepository: jest.fn((entidade: unknown) => repositorios.get(entidade)),
    };

    const dataSource = {
      transaction: jest.fn((callback: (m: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    service = new VotoService(dataSource as unknown as DataSource);
  });

  it('registra o voto e devolve apenas { registrado: true }', async () => {
    prepararCaminhoFeliz();

    const resultado = await service.registrarVoto(usuarioId, dto);

    expect(resultado).toEqual({ registrado: true });
    expect(controleRepo.save).toHaveBeenCalledTimes(1);
    expect(votoRepo.save).toHaveBeenCalledTimes(1);
  });

  it('garante o sigilo: o voto guarda só a candidatura, sem o eleitor', async () => {
    prepararCaminhoFeliz();

    await service.registrarVoto(usuarioId, dto);

    expect(votoRepo.create).toHaveBeenCalledWith({
      candidatura: { id: '10' },
    });
    const votoCriado = votoRepo.create.mock.calls[0][0] as object;
    expect(Object.keys(votoCriado)).toEqual(['candidatura']);
  });

  it('registra o controle de votação com eleitor, eleição e cargo', async () => {
    prepararCaminhoFeliz();

    await service.registrarVoto(usuarioId, dto);

    expect(controleRepo.create).toHaveBeenCalledWith({
      eleitor: { id: '3' },
      eleicao: { id: '1', situacao: { nome: 'ABERTA' } },
      cargo: { id: '4' },
    });
  });

  it('busca a candidatura filtrando por eleição e cargo informados', async () => {
    prepararCaminhoFeliz();

    await service.registrarVoto(usuarioId, dto);

    expect(candidaturaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id: '10',
        eleicao: { id: '1' },
        cargo: { id: '4' },
      },
    });
  });

  it('lança Forbidden quando o usuário não é um eleitor', async () => {
    eleitorRepo.findOne.mockResolvedValue(null);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
      new ForbiddenException('Usuário não é um eleitor.'),
    );
    expect(votoRepo.save).not.toHaveBeenCalled();
  });

  it('lança NotFound quando a eleição não existe', async () => {
    eleitorRepo.findOne.mockResolvedValue({ id: '3' });
    eleicaoRepo.findOne.mockResolvedValue(null);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
      new NotFoundException('Eleição não encontrada.'),
    );
    expect(votoRepo.save).not.toHaveBeenCalled();
  });

  it.each(['AGENDADA', 'ENCERRADA'])(
    'lança Conflict quando a eleição está %s',
    async (situacao) => {
      eleitorRepo.findOne.mockResolvedValue({ id: '3' });
      eleicaoRepo.findOne.mockResolvedValue({
        id: '1',
        situacao: { nome: situacao },
      });

      await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
        new ConflictException('A eleição não está aberta.'),
      );
      expect(votoRepo.save).not.toHaveBeenCalled();
    },
  );

  it('lança Forbidden quando o eleitor não está inscrito na eleição', async () => {
    prepararCaminhoFeliz();
    inscricaoRepo.findOne.mockResolvedValue(null);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
      new ForbiddenException('Eleitor não está inscrito nesta eleição.'),
    );
    expect(votoRepo.save).not.toHaveBeenCalled();
  });

  it('lança NotFound quando a candidatura não pertence à eleição e ao cargo', async () => {
    prepararCaminhoFeliz();
    candidaturaRepo.findOne.mockResolvedValue(null);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
      new NotFoundException('Candidatura não pertence a esta eleição e cargo.'),
    );
    expect(controleRepo.save).not.toHaveBeenCalled();
    expect(votoRepo.save).not.toHaveBeenCalled();
  });

  it('converte a violação da constraint única em Conflict (voto duplicado)', async () => {
    prepararCaminhoFeliz();
    controleRepo.save.mockRejectedValue(
      erroDeBanco('23505', 'UQ_controle_eleitor_eleicao_cargo'),
    );

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toThrow(
      new ConflictException(
        'Já existe um voto registrado para este cargo nesta eleição.',
      ),
    );
    expect(votoRepo.save).not.toHaveBeenCalled();
  });

  it('repassa erros de banco que não são de voto duplicado', async () => {
    prepararCaminhoFeliz();
    const erro = erroDeBanco('23505', 'OUTRA_CONSTRAINT');
    controleRepo.save.mockRejectedValue(erro);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toBe(erro);
  });

  it('repassa erros inesperados sem alterá-los', async () => {
    prepararCaminhoFeliz();
    const erro = new Error('falha de conexão');
    votoRepo.save.mockRejectedValue(erro);

    await expect(service.registrarVoto(usuarioId, dto)).rejects.toBe(erro);
  });
});
