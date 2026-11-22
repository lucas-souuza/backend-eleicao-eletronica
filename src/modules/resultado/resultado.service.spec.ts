import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ResultadoService } from './resultado.service';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { InscricaoEleitor } from '../inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Candidato } from '../candidato/entities/candidato.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';

describe('ResultadoService', () => {
  let service: ResultadoService;
  let eleicaoRepo: { findOne: jest.Mock };
  let eleitorRepo: { findOne: jest.Mock };
  let inscricaoRepo: { findOne: jest.Mock };
  let candidatoRepo: { findOne: jest.Mock };
  let candidaturaRepo: { findOne: jest.Mock };
  let query: jest.Mock;

  const linhas = [{ cargoId: '4', candidatoNome: 'Maria', totalVotos: '12' }];

  beforeEach(() => {
    eleicaoRepo = { findOne: jest.fn() };
    eleitorRepo = { findOne: jest.fn() };
    inscricaoRepo = { findOne: jest.fn() };
    candidatoRepo = { findOne: jest.fn() };
    candidaturaRepo = { findOne: jest.fn() };
    query = jest.fn().mockResolvedValue(linhas);

    const repositorios = new Map<unknown, unknown>([
      [Eleicao, eleicaoRepo],
      [Eleitor, eleitorRepo],
      [InscricaoEleitor, inscricaoRepo],
      [Candidato, candidatoRepo],
      [Candidatura, candidaturaRepo],
    ]);

    const dataSource = {
      getRepository: jest.fn((entidade: unknown) => repositorios.get(entidade)),
      query,
    };

    service = new ResultadoService(dataSource as unknown as DataSource);
  });

  const eleicaoComSituacao = (nome: string) => ({
    id: '1',
    situacao: { nome },
  });

  it('lança NotFound quando a eleição não existe', async () => {
    eleicaoRepo.findOne.mockResolvedValue(null);

    await expect(service.consultar('1', '7', 'ELEITOR')).rejects.toThrow(
      new NotFoundException('Eleição não encontrada.'),
    );
    expect(query).not.toHaveBeenCalled();
  });

  it('lança Conflict quando a eleição ainda está AGENDADA', async () => {
    eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('AGENDADA'));

    await expect(service.consultar('1', '7', 'ELEITOR')).rejects.toThrow(
      new ConflictException(
        'Os resultados ficam disponíveis quando a eleição abre.',
      ),
    );
    expect(query).not.toHaveBeenCalled();
  });

  describe('perfil ELEITOR', () => {
    it('lança Forbidden quando o usuário não é eleitor', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      eleitorRepo.findOne.mockResolvedValue(null);

      await expect(service.consultar('1', '7', 'ELEITOR')).rejects.toThrow(
        new ForbiddenException('Usuário não é um eleitor.'),
      );
      expect(query).not.toHaveBeenCalled();
    });

    it('lança Forbidden quando o eleitor não está inscrito na eleição', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      eleitorRepo.findOne.mockResolvedValue({ id: '3' });
      inscricaoRepo.findOne.mockResolvedValue(null);

      await expect(service.consultar('1', '7', 'ELEITOR')).rejects.toThrow(
        new ForbiddenException('Eleitor não está inscrito nesta eleição.'),
      );
      expect(query).not.toHaveBeenCalled();
    });

    it('retorna os resultados de todos os cargos, sem filtro por cargo', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      eleitorRepo.findOne.mockResolvedValue({ id: '3' });
      inscricaoRepo.findOne.mockResolvedValue({ id: '5' });

      const resultado = await service.consultar('1', '7', 'ELEITOR');

      expect(resultado).toEqual({
        eleicaoId: '1',
        situacao: 'ABERTA',
        resultados: linhas,
      });
      const [sql, parametros] = query.mock.calls[0] as [string, string[]];
      expect(parametros).toEqual(['1']);
      expect(sql).not.toContain('candidatura.cargo_id = $2');
    });

    it('permite consultar uma eleição ENCERRADA', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ENCERRADA'));
      eleitorRepo.findOne.mockResolvedValue({ id: '3' });
      inscricaoRepo.findOne.mockResolvedValue({ id: '5' });

      const resultado = await service.consultar('1', '7', 'ELEITOR');

      expect(resultado.situacao).toBe('ENCERRADA');
    });
  });

  describe('perfil CANDIDATO', () => {
    it('lança Forbidden quando o usuário não é candidato', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      candidatoRepo.findOne.mockResolvedValue(null);

      await expect(service.consultar('1', '7', 'CANDIDATO')).rejects.toThrow(
        new ForbiddenException('Usuário não é um candidato.'),
      );
      expect(query).not.toHaveBeenCalled();
    });

    it('lança Forbidden quando o candidato não concorre na eleição', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      candidatoRepo.findOne.mockResolvedValue({ id: '2' });
      candidaturaRepo.findOne.mockResolvedValue(null);

      await expect(service.consultar('1', '7', 'CANDIDATO')).rejects.toThrow(
        new ForbiddenException('Candidato não concorre nesta eleição.'),
      );
      expect(query).not.toHaveBeenCalled();
    });

    it('filtra os resultados apenas pelo cargo em que o candidato concorre', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));
      candidatoRepo.findOne.mockResolvedValue({ id: '2' });
      candidaturaRepo.findOne.mockResolvedValue({ cargo: { id: '4' } });

      const resultado = await service.consultar('1', '7', 'CANDIDATO');

      expect(resultado.resultados).toEqual(linhas);
      const [sql, parametros] = query.mock.calls[0] as [string, string[]];
      expect(parametros).toEqual(['1', '4']);
      expect(sql).toContain('candidatura.cargo_id = $2');
    });
  });

  it('lança Forbidden para perfis sem acesso aos resultados', async () => {
    eleicaoRepo.findOne.mockResolvedValue(eleicaoComSituacao('ABERTA'));

    await expect(
      service.consultar('1', '7', 'CHEFE_SECAO' as unknown as 'ELEITOR'),
    ).rejects.toThrow(new ForbiddenException('Perfil sem acesso aos resultados.'));
    expect(query).not.toHaveBeenCalled();
  });
});
