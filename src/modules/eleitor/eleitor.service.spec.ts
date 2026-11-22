import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { EleitorService } from './eleitor.service';
import { Eleitor } from './entities/eleitor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Perfil } from '../perfil/entities/perfil.entity';

describe('EleitorService', () => {
  const dto = {
    nome: '  João Souza  ',
    email: '  Joao.Souza@Eleicao.COM ',
    senha: 'Senha@123',
    cpf: '98765432100',
    titulo: '123456789012',
    telefone: ' 21988887777 ',
  };

  let service: EleitorService;
  let eleitorRepo: { create: jest.Mock; save: jest.Mock };
  let usuarioRepo: { create: jest.Mock; save: jest.Mock };
  let perfilRepo: { findOneBy: jest.Mock };

  beforeEach(() => {
    eleitorRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) =>
        Promise.resolve({ ...dados, id: '3', criadoEm: new Date('2026-01-01') }),
      ),
    };
    usuarioRepo = {
      create: jest.fn((dados: unknown) => dados),
      save: jest.fn((dados: object) => Promise.resolve({ ...dados, id: '7' })),
    };
    perfilRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: '2', nome: 'ELEITOR' }),
    };

    const repositorios = new Map<unknown, unknown>([
      [Eleitor, eleitorRepo],
      [Usuario, usuarioRepo],
      [Perfil, perfilRepo],
    ]);
    const manager = {
      getRepository: jest.fn((entidade: unknown) => repositorios.get(entidade)),
    };
    const dataSource = {
      transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)),
    };

    service = new EleitorService(dataSource as unknown as DataSource);
  });

  it('cadastra o eleitor e devolve apenas dados públicos', async () => {
    const resultado = await service.cadastrar(dto);

    expect(resultado).toEqual({
      id: '3',
      nome: 'João Souza',
      email: 'joao.souza@eleicao.com',
      criadoEm: new Date('2026-01-01'),
    });
  });

  it('nunca devolve senha, hash, CPF ou título na resposta', async () => {
    const resultado = await service.cadastrar(dto);

    expect(resultado).not.toHaveProperty('senha');
    expect(resultado).not.toHaveProperty('cpf');
    expect(resultado).not.toHaveProperty('tituloEleitor');
  });

  it('normaliza e-mail (trim + minúsculas) e vincula o perfil ELEITOR', async () => {
    await service.cadastrar(dto);

    expect(perfilRepo.findOneBy).toHaveBeenCalledWith({ nome: 'ELEITOR' });
    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'joao.souza@eleicao.com',
        perfil: { id: '2', nome: 'ELEITOR' },
      }),
    );
  });

  it('grava a senha como hash bcrypt, nunca em texto puro', async () => {
    await service.cadastrar(dto);

    const { senha } = usuarioRepo.create.mock.calls[0][0] as { senha: string };
    expect(senha).not.toBe(dto.senha);
    await expect(bcrypt.compare(dto.senha, senha)).resolves.toBe(true);
  });

  it('limpa espaços do nome e do telefone e mapeia o título', async () => {
    await service.cadastrar(dto);

    expect(eleitorRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Souza',
        cpf: '98765432100',
        tituloEleitor: '123456789012',
        telefone: '21988887777',
      }),
    );
  });

  it('grava telefone como null quando não informado ou em branco', async () => {
    await service.cadastrar({ ...dto, telefone: '   ' });

    expect(eleitorRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ telefone: null }),
    );
  });

  it('lança InternalServerError quando o perfil ELEITOR não existe', async () => {
    perfilRepo.findOneBy.mockResolvedValue(null);

    await expect(service.cadastrar(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(usuarioRepo.save).not.toHaveBeenCalled();
  });

  it('converte violação de unicidade (23505) em Conflict', async () => {
    usuarioRepo.save.mockRejectedValue(
      new QueryFailedError('INSERT ...', [], {
        code: '23505',
      } as unknown as Error),
    );

    await expect(service.cadastrar(dto)).rejects.toThrow(
      new ConflictException(
        'Já existe um usuário com esse e-mail, CPF ou título eleitoral.',
      ),
    );
  });

  it('repassa erros inesperados', async () => {
    const erro = new Error('banco fora do ar');
    eleitorRepo.save.mockRejectedValue(erro);

    await expect(service.cadastrar(dto)).rejects.toBe(erro);
  });
});
