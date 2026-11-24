import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / deve retornar 200 com Hello World!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET / deve retornar um content-type HTML textual', async () => {
    const response = await request(app.getHttpServer()).get('/');

    expect(response.headers['content-type']).toContain('text/html');
  });

  it('GET /rota-inexistente deve retornar 404', () => {
    return request(app.getHttpServer())
      .get('/rota-inexistente')
      .expect(404);
  });

  it('POST / deve retornar 404', () => {
    return request(app.getHttpServer())
      .post('/')
      .send({ nome: 'Teste' })
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
