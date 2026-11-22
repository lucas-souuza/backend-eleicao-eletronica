import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { CandidatoService } from './candidato.service';
import { Candidato } from './entities/candidato.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Perfil } from '../perfil/entities/perfil.entity';

describe('CandidatoService', () => {
  const dto = {
    nome: '  Maria Oliveira ',
    email: ' Maria.Oliveira@Eleicao.com ',
    senha: 'Senha@123',
    cpf: '12345678901',
    telefone: ' 21999998888 ',
  };

  let service: CandidatoService;
  let candidatoRepo: { create: jest.Mock; save: jest.Mock };
  let usuarioRepo: { create: jest.Mock; save: jest.Mock };
  let perfilRepo: { findOneBy: jest.Mock };

  beforeEach(() => {
    candidatoRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) =>
        Promise.resolve({ ...dados, id: '2', criadoEm: new Date('2026-01-01') }),
      ),
    };
    usuarioRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) => Promise.resolve({ ...dados, id: '8' })),
    };
    perfilRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: '3', nome: 'CANDIDATO' }),
    };

    const repositorios = new Map<unknown, unknown>([
      [Candidato, candidatoRepo],
      [Usuario, usuarioRepo],
      [Perfil, perfilRepo],
    ]);
    const manager = {
      getRepository: jest.fn((entidade: unknown) => repositorios.get(entidade)),
    };
    const dataSource = {
      transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)),
    };

    service = new CandidatoService(dataSource as unknown as DataSource);
  });

  it('cadastra o candidato e devolve apenas id, nome, e-mail e data', async () => {
    const resultado = await service.cadastrar(dto);

    expect(resultado).toEqual({
      id: '2',
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@eleicao.com',
      criadoEm: new Date('2026-01-01'),
    });
    expect(resultado).not.toHaveProperty('senha');
    expect(resultado).not.toHaveProperty('cpf');
    expect(resultado).not.toHaveProperty('telefone');
  });

  it('vincula o perfil CANDIDATO e guarda a senha como hash', async () => {
    await service.cadastrar(dto);

    expect(perfilRepo.findOneBy).toHaveBeenCalledWith({ nome: 'CANDIDATO' });
    const { senha, perfil } = usuarioRepo.create.mock.calls[0][0] as {
      senha: string;
      perfil: { nome: string };
    };
    expect(perfil.nome).toBe('CANDIDATO');
    expect(senha).not.toBe(dto.senha);
    await expect(bcrypt.compare(dto.senha, senha)).resolves.toBe(true);
  });

  it('grava telefone como null quando em branco', async () => {
    await service.cadastrar({ ...dto, telefone: '' });

    expect(candidatoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ telefone: null }),
    );
  });

  it('lança InternalServerError quando o perfil CANDIDATO não existe', async () => {
    perfilRepo.findOneBy.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('converte violação de unicidade (23505) em Conflict', async () => {
    candidatoRepo.save.mockRejectedValue(
      new QueryFailedError('INSERT ...', [], {
        code: '23505',
      } as unknown as Error),
    );

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new ConflictException(
        'Já existe um usuário com esse e-mail ou um candidato com esse CPF.',
      ),
    );
  });

  it('repassa erros inesperados', async () => {
    const erro = new Error('falha');
    usuarioRepo.save.mockRejectedValue(erro);

    await expect(service.cadastrar(dto)).rejects.toBe(erro);
  });
});
