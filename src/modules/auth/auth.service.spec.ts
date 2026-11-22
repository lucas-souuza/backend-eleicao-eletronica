import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { Usuario } from '../usuario/entities/usuario.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepo: { findOne: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let hashDaSenha: string;

  const senhaCorreta = 'Senha@123';

  beforeAll(async () => {
    // Custo baixo (4) só para o teste ficar rápido; a lógica é a mesma.
    hashDaSenha = await bcrypt.hash(senhaCorreta, 4);
  });

  beforeEach(() => {
    usuarioRepo = { findOne: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token.jwt.falso') };

    service = new AuthService(
      usuarioRepo as unknown as Repository<Usuario>,
      jwtService as unknown as JwtService,
    );
  });

  const usuarioCadastrado = () => ({
    id: '7',
    email: 'chefe@eleicao.com',
    senha: hashDaSenha,
    perfil: { nome: 'CHEFE_SECAO' },
  });

  it('retorna o token Bearer quando as credenciais são válidas', async () => {
    usuarioRepo.findOne.mockResolvedValue(usuarioCadastrado());

    const resultado = await service.login({
      email: 'chefe@eleicao.com',
      senha: senhaCorreta,
    });

    expect(resultado).toEqual({
      access_token: 'token.jwt.falso',
      token_type: 'Bearer',
    });
  });

  it('busca o usuário pelo e-mail carregando o perfil', async () => {
    usuarioRepo.findOne.mockResolvedValue(usuarioCadastrado());

    await service.login({ email: 'chefe@eleicao.com', senha: senhaCorreta });

    expect(usuarioRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'chefe@eleicao.com' },
      relations: { perfil: true },
    });
  });

  it('assina o token com o id do usuário (sub) e o nome do perfil', async () => {
    usuarioRepo.findOne.mockResolvedValue(usuarioCadastrado());

    await service.login({ email: 'chefe@eleicao.com', senha: senhaCorreta });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '7',
      perfil: 'CHEFE_SECAO',
    });
  });

  it('lança Unauthorized quando o e-mail não existe', async () => {
    usuarioRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ninguem@eleicao.com', senha: senhaCorreta }),
    ).rejects.toThrow(new UnauthorizedException('E-mail ou senha inválidos.'));
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança Unauthorized quando a senha está errada', async () => {
    usuarioRepo.findOne.mockResolvedValue(usuarioCadastrado());

    await expect(
      service.login({ email: 'chefe@eleicao.com', senha: 'SenhaErrada@1' }),
    ).rejects.toThrow(new UnauthorizedException('E-mail ou senha inválidos.'));
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('usa a mesma mensagem para e-mail inexistente e senha errada (não revela qual falhou)', async () => {
    usuarioRepo.findOne.mockResolvedValueOnce(null);
    const semUsuario = await service
      .login({ email: 'x@x.com', senha: senhaCorreta })
      .catch((e: UnauthorizedException) => e.message);

    usuarioRepo.findOne.mockResolvedValueOnce(usuarioCadastrado());
    const senhaErrada = await service
      .login({ email: 'chefe@eleicao.com', senha: 'SenhaErrada@1' })
      .catch((e: UnauthorizedException) => e.message);

    expect(semUsuario).toBe(senhaErrada);
  });
});
