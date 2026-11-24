import { randomInt, randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { AuthModule } from '../src/modules/auth/auth.module';
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
import { VotoModule } from '../src/modules/voto/voto.module';
import { ResultadoModule } from '../src/modules/resultado/resultado.module';
import {
  createE2eConfigModule,
  createE2eDatabaseModule,
} from './e2e-test-database';

const PERFIL_ELEITOR = 'ELEITOR';

describe('VotoController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule;
  let fixture:
    | {
        usuario: Usuario;
        eleitor: Eleitor;
        eleicao: Eleicao;
        cargo: Cargo;
        candidato: Candidato;
        partido: Partido;
        candidatura: Candidatura;
        inscricao: InscricaoEleitor;
      }
    | undefined;
  let token: string;

  function getHttpServer() {
    if (!app) {
      throw new Error('A aplicação E2E ainda não foi inicializada.');
    }

    return app.getHttpServer();
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        createE2eConfigModule(),
        createE2eDatabaseModule(),
        AuthModule,
        VotoModule,
        ResultadoModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1/api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    const perfilRepository = dataSource.getRepository(Perfil);
    const usuarioRepository = dataSource.getRepository(Usuario);
    const eleitorRepository = dataSource.getRepository(Eleitor);
    const situacaoRepository = dataSource.getRepository(SituacaoEleicao);
    const eleicaoRepository = dataSource.getRepository(Eleicao);
    const cargoRepository = dataSource.getRepository(Cargo);
    const candidatoRepository = dataSource.getRepository(Candidato);
    const partidoRepository = dataSource.getRepository(Partido);
    const candidaturaRepository = dataSource.getRepository(Candidatura);
    const inscricaoRepository = dataSource.getRepository(InscricaoEleitor);

    let perfil = await perfilRepository.findOneBy({ nome: PERFIL_ELEITOR });
    if (!perfil) {
      perfil = await perfilRepository.save(
        perfilRepository.create({
          nome: PERFIL_ELEITOR,
          descricao: 'Perfil usado nos testes E2E.',
        }),
      );
    }

    let situacao = await situacaoRepository.findOneBy({ nome: 'ABERTA' });
    if (!situacao) {
      situacao = await situacaoRepository.save(
        situacaoRepository.create({
          nome: 'ABERTA',
          descricao: 'Votação aberta para teste.',
        }),
      );
    }

    const identificador = randomUUID().replace(/-/g, '').slice(0, 10);
    const email = `voto-${identificador}@example.test`;
    const usuario = await usuarioRepository.save(
      usuarioRepository.create({
        email,
        senha: await bcrypt.hash('Senha-de-teste-123', 10),
        perfil,
      }),
    );

    const eleitor = await eleitorRepository.save(
      eleitorRepository.create({
        nome: 'Eleitor E2E',
        cpf: randomInt(0, 10_000_000_000).toString().padStart(11, '0'),
        tituloEleitor: randomInt(0, 1_000_000_000_000)
          .toString()
          .padStart(12, '0'),
        usuario,
      }),
    );

    const eleicao = await eleicaoRepository.save(
      eleicaoRepository.create({
        dataEleicao: '2030-01-01',
        turno: 1,
        horarioAbertura: '08:00:00',
        horarioEncerramento: '17:00:00',
        situacao,
      }),
    );

    const cargo = await cargoRepository.save(
      cargoRepository.create({ nome: `Cargo E2E ${identificador}` }),
    );
    const candidato = await candidatoRepository.save(
      candidatoRepository.create({
        nome: 'Candidato E2E',
        cpf: randomInt(0, 10_000_000_000).toString().padStart(11, '0'),
      }),
    );
    const partido = await partidoRepository.save(
      partidoRepository.create({
        nome: `Partido E2E ${identificador}`,
        sigla: `T${identificador.toUpperCase()}`,
      }),
    );
    const candidatura = await candidaturaRepository.save(
      candidaturaRepository.create({
        numeroEleitoral: '9876',
        candidato,
        eleicao,
        cargo,
        partido,
      }),
    );
    const inscricao = await inscricaoRepository.save(
      inscricaoRepository.create({ eleitor, eleicao }),
    );

    fixture = {
      usuario,
      eleitor,
      eleicao,
      cargo,
      candidato,
      partido,
      candidatura,
      inscricao,
    };

    token = await moduleFixture
      .get<JwtService>(JwtService)
      .signAsync({ sub: usuario.id, perfil: PERFIL_ELEITOR });
  });

  afterAll(async () => {
    if (!app) {
      return;
    }

    if (fixture) {
      const dataSource = moduleFixture.get(DataSource);
      const votoRepository = dataSource.getRepository(Voto);
      const controleRepository = dataSource.getRepository(ControleVotacao);

      const votos = await votoRepository.find({
        where: { candidatura: { id: fixture.candidatura.id } },
      });
      await votoRepository.remove(votos);

      const controles = await controleRepository.find({
        where: {
          eleitor: { id: fixture.eleitor.id },
          eleicao: { id: fixture.eleicao.id },
        },
      });
      await controleRepository.remove(controles);

      await dataSource
        .getRepository(InscricaoEleitor)
        .delete(fixture.inscricao.id);
      await dataSource
        .getRepository(Candidatura)
        .delete(fixture.candidatura.id);
      await dataSource.getRepository(Candidato).delete(fixture.candidato.id);
      await dataSource.getRepository(Partido).delete(fixture.partido.id);
      await dataSource.getRepository(Cargo).delete(fixture.cargo.id);
      await dataSource.getRepository(Eleicao).delete(fixture.eleicao.id);
      await dataSource.getRepository(Eleitor).delete(fixture.eleitor.id);
      await dataSource.getRepository(Usuario).delete(fixture.usuario.id);
    }

    await app.close();
  });

  it('deve registrar um voto válido e rejeitar outro voto no mesmo cargo', async () => {
    if (!fixture) {
      throw new Error('Os dados de votação E2E não foram preparados.');
    }

    const voto = {
      eleicaoId: fixture.eleicao.id,
      cargoId: fixture.cargo.id,
      candidaturaId: fixture.candidatura.id,
    };

    await request(getHttpServer())
      .post('/v1/api/votos')
      .set('Authorization', `Bearer ${token}`)
      .send(voto)
      .expect(201)
      .expect({ registrado: true });

    const votoRepository = moduleFixture.get<Repository<Voto>>(
      getRepositoryToken(Voto),
    );
    expect(
      await votoRepository.count({
        where: { candidatura: { id: fixture.candidatura.id } },
      }),
    ).toBe(1);

    await request(getHttpServer())
      .post('/v1/api/votos')
      .set('Authorization', `Bearer ${token}`)
      .send(voto)
      .expect(409);

    expect(
      await votoRepository.count({
        where: { candidatura: { id: fixture.candidatura.id } },
      }),
    ).toBe(1);

    const resultadoParcial = await request(getHttpServer())
      .get(`/v1/api/eleicoes/${fixture.eleicao.id}/resultados`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resultadoParcial.body.eleicaoId).toBe(fixture.eleicao.id);
    expect(resultadoParcial.body.situacao).toBe('ABERTA');

    const candidaturaParcial = resultadoParcial.body.resultados.find(
      (resultado: { candidaturaId: string }) =>
        resultado.candidaturaId === fixture!.candidatura.id,
    );
    expect(candidaturaParcial).toBeDefined();
    expect(candidaturaParcial.totalVotos).toBe('1');

    const situacaoRepository = moduleFixture
      .get<DataSource>(DataSource)
      .getRepository(SituacaoEleicao);
    let situacaoEncerrada = await situacaoRepository.findOneBy({
      nome: 'ENCERRADA',
    });
    if (!situacaoEncerrada) {
      situacaoEncerrada = await situacaoRepository.save({
        nome: 'ENCERRADA',
        descricao: 'Votação encerrada para teste.',
      });
    }

    fixture.eleicao.situacao = situacaoEncerrada;
    await moduleFixture
      .get<DataSource>(DataSource)
      .getRepository(Eleicao)
      .save(fixture.eleicao);

    const resultadoFinal = await request(getHttpServer())
      .get(`/v1/api/eleicoes/${fixture.eleicao.id}/resultados`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resultadoFinal.body.situacao).toBe('ENCERRADA');

    const candidaturaFinal = resultadoFinal.body.resultados.find(
      (resultado: { candidaturaId: string }) =>
        resultado.candidaturaId === fixture!.candidatura.id,
    );
    expect(candidaturaFinal).toBeDefined();
    expect(candidaturaFinal.totalVotos).toBe('1');
  });
});
