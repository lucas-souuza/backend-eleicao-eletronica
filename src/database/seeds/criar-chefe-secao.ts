// src/database/seeds/criar-chefe-secao.ts

import 'dotenv/config';
import * as bcrypt from 'bcryptjs';

import dataSource from '../data-source';
import { Perfil } from '../../modules/perfil/entities/perfil.entity';
import { Usuario } from '../../modules/usuario/entities/usuario.entity';

async function criarChefeSecao(): Promise<void> {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !senha) {
    throw new Error(
      'Configure INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD no .env.',
    );
  }

  if (senha.length < 8) {
    throw new Error('A senha inicial deve ter pelo menos 8 caracteres.');
  }

  await dataSource.initialize();

  const usuarioRepository = dataSource.getRepository(Usuario);
  const perfilRepository = dataSource.getRepository(Perfil);

  const usuarioExistente = await usuarioRepository.findOneBy({ email });

  if (usuarioExistente) {
    console.log(
      `Já existe um usuário com o e-mail ${email}. Nada foi alterado.`,
    );
    return;
  }

  const perfil = await perfilRepository.findOneBy({
    nome: 'CHEFE_SECAO',
  });

  if (!perfil) {
    throw new Error(
      'Perfil CHEFE_SECAO não encontrado. Confira se a migration de dados foi executada.',
    );
  }

  const usuario = usuarioRepository.create({
    email,
    senha: await bcrypt.hash(senha, 12),
    perfil,
  });

  await usuarioRepository.save(usuario);

  console.log(`Usuário CHEFE_SECAO criado: ${email}`);
}

criarChefeSecao()
  .catch((erro: unknown) => {
    console.error('Falha ao criar o usuário inicial:', erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
