import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/modules/auth/auth.module';
import { Perfil } from '../src/modules/perfil/entities/perfil.entity';
import { Usuario } from '../src/modules/usuario/entities/usuario.entity';
import {
  createE2eConfigModule,
  createE2eDatabaseModule,
} from './e2e-test-database';

const TEST_EMAIL = 'auth-e2e@example.test';
const TEST_PASSWORD = 'Senha-de-teste-123';
const TEST_PROFILE = 'ELEITOR';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule;
  let usuarioId: string;

  function getHttpServer() {
    if (!app) {
      throw new Error('A aplicação E2E ainda não foi inicializada.');
    }

    return app.getHttpServer();
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [createE2eConfigModule(), createE2eDatabaseModule(), AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1/api');
    await app.init();

    const usuarioRepository = moduleFixture.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    const perfilRepository = moduleFixture.get<Repository<Perfil>>(
      getRepositoryToken(Perfil),
    );

    await usuarioRepository.delete({ email: TEST_EMAIL });

    let perfil = await perfilRepository.findOneBy({ nome: TEST_PROFILE });
    if (!perfil) {
      perfil = await perfilRepository.save(
        perfilRepository.create({
          nome: TEST_PROFILE,
          descricao: 'Perfil usado nos testes E2E.',
        }),
      );
    }

    const usuario = await usuarioRepository.save(
      usuarioRepository.create({
        email: TEST_EMAIL,
        senha: await bcrypt.hash(TEST_PASSWORD, 10),
        perfil,
      }),
    );
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    if (!app) {
      return;
    }

    const usuarioRepository = moduleFixture.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    await usuarioRepository.delete({ email: TEST_EMAIL });
    await app.close();
  });

  it('GET /auth/me deve rejeitar uma requisição sem token', () => {
    return request(getHttpServer()).get('/v1/api/auth/me').expect(401);
  });

  it('POST /auth/login deve autenticar e permitir consultar /auth/me', async () => {
    const respostaLogin = await request(getHttpServer())
      .post('/v1/api/auth/login')
      .send({ email: TEST_EMAIL, senha: TEST_PASSWORD })
      .expect(200);

    expect(respostaLogin.body).toEqual({
      access_token: expect.any(String),
      token_type: 'Bearer',
    });

    await request(getHttpServer())
      .get('/v1/api/auth/me')
      .set('Authorization', `Bearer ${respostaLogin.body.access_token}`)
      .expect(200)
      .expect({
        usuarioId: usuarioId,
        perfil: TEST_PROFILE,
      });
  });

  it('POST /auth/login deve rejeitar uma senha incorreta', () => {
    return request(getHttpServer())
      .post('/v1/api/auth/login')
      .send({ email: TEST_EMAIL, senha: 'senha-incorreta-123' })
      .expect(401);
  });

  it('GET /auth/me deve rejeitar um token inválido', () => {
    return request(getHttpServer())
      .get('/v1/api/auth/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });
});
