import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { EleicaoService } from './eleicao.service';
import { Eleicao } from './entities/eleicao.entity';
import { SituacaoEleicao } from '../situacao-eleicao/entities/situacao-eleicao.entity';

describe('EleicaoService', () => {
  let service: EleicaoService;
  let eleicaoRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let situacaoRepo: { findOneBy: jest.Mock };

  const dtoValido = {
    dataEleicao: '2026-12-06',
    turno: 1,
    horarioAbertura: '08:00',
    horarioEncerramento: '17:00',
  };

  const eleicaoExistente = (situacao: string) => ({
    id: '1',
    dataEleicao: '2026-12-06',
    turno: 1,
    horarioAbertura: '08:00',
    horarioEncerramento: '17:00',
    situacao: { id: '9', nome: situacao },
    criadoEm: new Date('2026-01-01T00:00:00Z'),
  });

  beforeEach(() => {
    eleicaoRepo = {
      findOne: jest.fn(),
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: unknown) => Promise.resolve(dados)),
    };
    situacaoRepo = {
      findOneBy: jest.fn(({ nome }: { nome: string }) =>
        Promise.resolve({ id: '9', nome }),
      ),
    };

    service = new EleicaoService(
      eleicaoRepo as unknown as Repository<Eleicao>,
      situacaoRepo as unknown as Repository<SituacaoEleicao>,
    );
  });

  describe('criar', () => {
    it('cria a eleição com situação AGENDADA', async () => {
      eleicaoRepo.save.mockImplementation((e: object) =>
        Promise.resolve({ ...e, id: '1', criadoEm: new Date() }),
      );

      const resultado = await service.criar(dtoValido);

      expect(situacaoRepo.findOneBy).toHaveBeenCalledWith({ nome: 'AGENDADA' });
      expect(eleicaoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dataEleicao: '2026-12-06',
          turno: 1,
          situacao: { id: '9', nome: 'AGENDADA' },
        }),
      );
      expect(resultado).toMatchObject({
        id: '1',
        situacao: 'AGENDADA',
        horarioAbertura: '08:00',
        horarioEncerramento: '17:00',
      });
    });

    it('aceita horários com segundos (HH:mm:ss)', async () => {
      await expect(
        service.criar({
          ...dtoValido,
          horarioAbertura: '08:00:00',
          horarioEncerramento: '08:00:01',
        }),
      ).resolves.toBeDefined();
    });

    it.each([
      ['abertura igual ao encerramento', '08:00', '08:00'],
      ['abertura depois do encerramento', '18:00', '17:00'],
      ['diferença apenas nos segundos (invertida)', '08:00:30', '08:00:10'],
    ])('lança BadRequest quando há %s', async (_nome, abertura, encerramento) => {
      await expect(
        service.criar({
          ...dtoValido,
          horarioAbertura: abertura,
          horarioEncerramento: encerramento,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'O horário de abertura deve ser anterior ao de encerramento.',
        ),
      );
      expect(eleicaoRepo.save).not.toHaveBeenCalled();
    });

    it('lança InternalServerError quando a situação AGENDADA não existe', async () => {
      situacaoRepo.findOneBy.mockResolvedValue(null);

      await expect(service.criar(dtoValido)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(eleicaoRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('abrir', () => {
    it('muda a situação de AGENDADA para ABERTA', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoExistente('AGENDADA'));

      const resultado = await service.abrir('1');

      expect(situacaoRepo.findOneBy).toHaveBeenCalledWith({ nome: 'ABERTA' });
      expect(resultado.situacao).toBe('ABERTA');
      expect(eleicaoRepo.save).toHaveBeenCalledTimes(1);
    });

    it.each(['ABERTA', 'ENCERRADA'])(
      'lança Conflict ao tentar abrir uma eleição %s',
      async (situacao) => {
        eleicaoRepo.findOne.mockResolvedValue(eleicaoExistente(situacao));

        await expect(service.abrir('1')).rejects.toThrow(
          new ConflictException('Só é possível abrir uma eleição agendada.'),
        );
        expect(eleicaoRepo.save).not.toHaveBeenCalled();
      },
    );
  });

  describe('encerrar', () => {
    it('muda a situação de ABERTA para ENCERRADA', async () => {
      eleicaoRepo.findOne.mockResolvedValue(eleicaoExistente('ABERTA'));

      const resultado = await service.encerrar('1');

      expect(situacaoRepo.findOneBy).toHaveBeenCalledWith({
        nome: 'ENCERRADA',
      });
      expect(resultado.situacao).toBe('ENCERRADA');
    });

    it.each(['AGENDADA', 'ENCERRADA'])(
      'lança Conflict ao tentar encerrar uma eleição %s',
      async (situacao) => {
        eleicaoRepo.findOne.mockResolvedValue(eleicaoExistente(situacao));

        await expect(service.encerrar('1')).rejects.toThrow(
          new ConflictException('Só é possível encerrar uma eleição aberta.'),
        );
        expect(eleicaoRepo.save).not.toHaveBeenCalled();
      },
    );
  });

  describe('validação do identificador', () => {
    it.each(['0', '-1', 'abc', '1.5', '', '01'])(
      'lança BadRequest para o id inválido "%s"',
      async (id) => {
        await expect(service.abrir(id)).rejects.toThrow(
          new BadRequestException('Identificador de eleição inválido.'),
        );
        expect(eleicaoRepo.findOne).not.toHaveBeenCalled();
      },
    );

    it('lança NotFound quando a eleição não existe', async () => {
      eleicaoRepo.findOne.mockResolvedValue(null);

      await expect(service.encerrar('99')).rejects.toThrow(
        new NotFoundException('Eleição não encontrada.'),
      );
    });
  });
});
