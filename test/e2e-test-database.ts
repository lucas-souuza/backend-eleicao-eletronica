import 'dotenv/config';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidato } from '../src/modules/candidato/entities/candidato.entity';
import { Candidatura } from '../src/modules/candidatura/entities/candidatura.entity';
import { Cargo } from '../src/modules/cargo/entities/cargo.entity';
import { ControleVotacao } from '../src/modules/controle-votacao/entities/controle-votacao.entity';
import { Eleicao } from '../src/modules/eleicao/entities/eleicao.entity';
import { Eleitor } from '../src/modules/eleitor/entities/eleitor.entity';
import { InscricaoEleitor } from '../src/modules/inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Partido } from '../src/modules/partido/entities/partido.entity';
import { Perfil } from '../src/modules/perfil/entities/perfil.entity';
import { SituacaoEleicao } from '../src/modules/situacao-eleicao/entities/situacao-eleicao.entity';
import { Usuario } from '../src/modules/usuario/entities/usuario.entity';
import { Voto } from '../src/modules/voto/entities/voto.entity';

export const JWT_TEST_SECRET = 'e2e-only-secret';

const TEST_ENTITIES = [
  Candidato,
  Candidatura,
  Cargo,
  ControleVotacao,
  Eleicao,
  Eleitor,
  InscricaoEleitor,
  Partido,
  Perfil,
  SituacaoEleicao,
  Usuario,
  Voto,
];

export function createE2eConfigModule() {
  return ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: true,
    load: [() => ({ JWT_SECRET: JWT_TEST_SECRET })],
  });
}

export function createE2eDatabaseModule() {
  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Defina TEST_DATABASE_URL para um banco PostgreSQL exclusivo de testes.',
    );
  }

  let databaseName: string;

  try {
    databaseName = decodeURIComponent(new URL(databaseUrl).pathname)
      .replace(/^\/+/, '')
      .toLowerCase();
  } catch {
    throw new Error('TEST_DATABASE_URL deve ser uma URL PostgreSQL válida.');
  }

  if (!/(^|[_-])test$/.test(databaseName)) {
    throw new Error(
      'O nome do banco em TEST_DATABASE_URL deve terminar em "_test" ou "-test"; nenhum banco foi acessado.',
    );
  }

  return TypeOrmModule.forRoot({
    type: 'postgres',
    url: databaseUrl,
    ssl: process.env.TEST_DATABASE_SSL === 'true',
    entities: TEST_ENTITIES,
    synchronize: true,
  });
}
