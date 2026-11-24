import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';

const JWT_TEST_SECRET = 'e2e-only-secret';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: JWT_TEST_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key !== 'JWT_SECRET') {
                throw new Error(`Unexpected configuration key: ${key}`);
              }

              return JWT_TEST_SECRET;
            },
          },
        },
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1/api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/me deve rejeitar uma requisição sem token', () => {
    return request(app.getHttpServer()).get('/v1/api/auth/me').expect(401);
  });

  it('GET /auth/me deve retornar a identidade contida em um JWT válido', async () => {
    const token = await jwtService.signAsync({
      sub: 'usuario-e2e',
      perfil: 'ELEITOR',
    });

    return request(app.getHttpServer())
      .get('/v1/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({
        usuarioId: 'usuario-e2e',
        perfil: 'ELEITOR',
      });
  });

  it('GET /auth/me deve rejeitar um token inválido', () => {
    return request(app.getHttpServer())
      .get('/v1/api/auth/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });
});
