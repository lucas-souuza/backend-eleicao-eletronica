import 'dotenv/config';
import * as bcrypt from 'bcryptjs';

import dataSource from '../data-source';
import { Candidato } from '../../modules/candidato/entities/candidato.entity';
import { Candidatura } from '../../modules/candidatura/entities/candidatura.entity';
import { Cargo } from '../../modules/cargo/entities/cargo.entity';
import { Eleicao } from '../../modules/eleicao/entities/eleicao.entity';
import { Eleitor } from '../../modules/eleitor/entities/eleitor.entity';
import { InscricaoEleitor } from '../../modules/inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Partido } from '../../modules/partido/entities/partido.entity';
import { Perfil } from '../../modules/perfil/entities/perfil.entity';
import { SituacaoEleicao } from '../../modules/situacao-eleicao/entities/situacao-eleicao.entity';
import { Usuario } from '../../modules/usuario/entities/usuario.entity';

function dataDeHojeEmSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function criarCenarioVotacao(): Promise<void> {
  const senha = process.env.SEED_VOTACAO_PASSWORD;

  if (!senha || senha.length < 8) {
    throw new Error(
      'Configure SEED_VOTACAO_PASSWORD no .env com pelo menos 8 caracteres.',
    );
  }

  // Calcula o hash aqui para obter uma string antes de usá-lo na função interna.
  const senhaHash: string = await bcrypt.hash(senha, 12);

  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    const perfis = manager.getRepository(Perfil);
    const usuarios = manager.getRepository(Usuario);
    const eleitores = manager.getRepository(Eleitor);
    const candidatos = manager.getRepository(Candidato);
    const situacoes = manager.getRepository(SituacaoEleicao);
    const eleicoes = manager.getRepository(Eleicao);
    const cargos = manager.getRepository(Cargo);
    const partidos = manager.getRepository(Partido);
    const inscricoes = manager.getRepository(InscricaoEleitor);
    const candidaturas = manager.getRepository(Candidatura);

    const perfilEleitor = await perfis.findOneBy({ nome: 'ELEITOR' });
    const perfilCandidato = await perfis.findOneBy({ nome: 'CANDIDATO' });
    const situacaoAberta = await situacoes.findOneBy({ nome: 'ABERTA' });
    const [cargoEncontrado] = await cargos.find({
      order: { id: 'ASC' },
      take: 1,
    });

    if (
      !perfilEleitor ||
      !perfilCandidato ||
      !situacaoAberta ||
      !cargoEncontrado
    ) {
      throw new Error(
        'Faltam dados-base. Confira os perfis ELEITOR/CANDIDATO, a situação ABERTA e os cargos.',
      );
    }

    // O tipo explícito preserva o estreitamento de null dentro da função interna.
    const cargo: Cargo = cargoEncontrado;

    const partidoExistente = await partidos.findOneBy({ sigla: 'PDEM' });
    const partido =
      partidoExistente ??
      (await partidos.save(
        partidos.create({
          nome: 'Partido de Demonstração',
          sigla: 'PDEM',
        }),
      ));

    async function obterOuCriarUsuario(
      email: string,
      perfil: Perfil,
    ): Promise<Usuario> {
      const usuarioExistente = await usuarios.findOne({
        where: { email },
        relations: { perfil: true },
      });

      if (usuarioExistente) {
        if (usuarioExistente.perfil.id !== perfil.id) {
          throw new Error(`O usuário ${email} já existe com outro perfil.`);
        }

        return usuarioExistente;
      }

      const usuario = usuarios.create({
        email,
        senha: senhaHash,
        perfil,
      });

      return usuarios.save(usuario);
    }

    const usuarioEleitor = await obterOuCriarUsuario(
      'demo.eleitor@example.test',
      perfilEleitor,
    );

    const usuarioCandidato1 = await obterOuCriarUsuario(
      'demo.candidato1@example.test',
      perfilCandidato,
    );

    const usuarioCandidato2 = await obterOuCriarUsuario(
      'demo.candidato2@example.test',
      perfilCandidato,
    );

    const eleitorExistente = await eleitores.findOne({
      where: { usuario: { id: usuarioEleitor.id } },
    });

    const eleitor =
      eleitorExistente ??
      (await eleitores.save(
        eleitores.create({
          usuario: usuarioEleitor,
          nome: 'Eleitor de Demonstração',
          cpf: '90000000001',
          tituloEleitor: '900000000001',
          telefone: null,
        }),
      ));

    async function obterOuCriarCandidato(
      usuario: Usuario,
      nome: string,
      cpf: string,
    ): Promise<Candidato> {
      const candidatoExistente = await candidatos.findOne({
        where: { usuario: { id: usuario.id } },
      });

      if (candidatoExistente) {
        return candidatoExistente;
      }

      return candidatos.save(
        candidatos.create({
          usuario,
          nome,
          cpf,
          telefone: null,
        }),
      );
    }

    const candidato1 = await obterOuCriarCandidato(
      usuarioCandidato1,
      'Candidato de Demonstração 1',
      '90000000002',
    );

    const candidato2 = await obterOuCriarCandidato(
      usuarioCandidato2,
      'Candidato de Demonstração 2',
      '90000000003',
    );

    const hoje = dataDeHojeEmSaoPaulo();

    const eleicaoExistente = await eleicoes.findOne({
      where: { dataEleicao: hoje, turno: 1 },
      relations: { situacao: true },
    });

    const eleicaoParaSalvar =
      eleicaoExistente ??
      eleicoes.create({
        dataEleicao: hoje,
        turno: 1,
        horarioAbertura: '00:00:00',
        horarioEncerramento: '23:59:59',
        situacao: situacaoAberta,
      });

    eleicaoParaSalvar.situacao = situacaoAberta;
    eleicaoParaSalvar.horarioAbertura = '00:00:00';
    eleicaoParaSalvar.horarioEncerramento = '23:59:59';

    const eleicao = await eleicoes.save(eleicaoParaSalvar);

    const inscricaoExistente = await inscricoes.findOne({
      where: { eleitor: { id: eleitor.id } },
      relations: { eleicao: true },
    });

    if (!inscricaoExistente) {
      await inscricoes.save(
        inscricoes.create({
          eleitor,
          eleicao,
        }),
      );
    } else if (inscricaoExistente.eleicao.id !== eleicao.id) {
      throw new Error(
        'O eleitor de demonstração já está inscrito em outra eleição.',
      );
    }

    async function criarCandidaturaSeAusente(
      candidato: Candidato,
      numeroEleitoral: string,
    ): Promise<void> {
      const candidaturaExistente = await candidaturas.findOne({
        where: {
          candidato: { id: candidato.id },
          eleicao: { id: eleicao.id },
        },
      });

      if (candidaturaExistente) {
        return;
      }

      await candidaturas.save(
        candidaturas.create({
          candidato,
          eleicao,
          cargo,
          partido,
          numeroEleitoral,
        }),
      );
    }

    await criarCandidaturaSeAusente(candidato1, '90001');
    await criarCandidaturaSeAusente(candidato2, '90002');

    console.log('Cenário de votação preparado.');
    console.log('Eleitor: demo.eleitor@example.test');
    console.log('Senha: valor configurado em SEED_VOTACAO_PASSWORD');
    console.log(`Eleição: ${eleicao.dataEleicao}, turno ${eleicao.turno}`);
    console.log(`Cargo: ${cargo.nome}`);
    console.log('Nenhum voto foi inserido.');
  });
}

criarCenarioVotacao()
  .catch((erro: unknown) => {
    console.error('Falha ao preparar o cenário de votação:', erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
