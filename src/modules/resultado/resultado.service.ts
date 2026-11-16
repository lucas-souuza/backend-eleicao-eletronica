// src/resultado/resultado.service.ts

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { InscricaoEleitor } from '../inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Candidato } from '../candidato/entities/candidato.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';

type PerfilUsuario = 'ELEITOR' | 'CANDIDATO';

@Injectable()
export class ResultadoService {
  constructor(private readonly dataSource: DataSource) {}

  async consultar(eleicaoId: string, usuarioId: string, perfil: PerfilUsuario) {
    const eleicao = await this.dataSource.getRepository(Eleicao).findOne({
      where: { id: eleicaoId },
      relations: { situacao: true },
    });

    if (!eleicao) {
      throw new NotFoundException('Eleição não encontrada.');
    }

    if (eleicao.situacao.nome === 'AGENDADA') {
      throw new ConflictException(
        'Os resultados ficam disponíveis quando a eleição abre.',
      );
    }

    let cargoIdDoCandidato: string | undefined;

    if (perfil === 'ELEITOR') {
      const eleitor = await this.dataSource
        .getRepository(Eleitor)
        .findOne({ where: { usuario: { id: usuarioId } } });

      if (!eleitor) {
        throw new ForbiddenException('Usuário não é um eleitor.');
      }

      const inscricao = await this.dataSource
        .getRepository(InscricaoEleitor)
        .findOne({
          where: {
            eleitor: { id: eleitor.id },
            eleicao: { id: eleicao.id },
          },
        });

      if (!inscricao) {
        throw new ForbiddenException(
          'Eleitor não está inscrito nesta eleição.',
        );
      }
    } else if (perfil === 'CANDIDATO') {
      const candidato = await this.dataSource
        .getRepository(Candidato)
        .findOne({ where: { usuario: { id: usuarioId } } });

      if (!candidato) {
        throw new ForbiddenException('Usuário não é um candidato.');
      }

      const candidatura = await this.dataSource
        .getRepository(Candidatura)
        .findOne({
          where: {
            candidato: { id: candidato.id },
            eleicao: { id: eleicao.id },
          },
          relations: { cargo: true },
        });

      if (!candidatura) {
        throw new ForbiddenException('Candidato não concorre nesta eleição.');
      }

      cargoIdDoCandidato = candidatura.cargo.id;
    } else {
      throw new ForbiddenException('Perfil sem acesso aos resultados.');
    }

    const filtroCargo = cargoIdDoCandidato
      ? 'AND candidatura.cargo_id = $2'
      : '';

    const parametros = cargoIdDoCandidato
      ? [eleicao.id, cargoIdDoCandidato]
      : [eleicao.id];

    const resultados = await this.dataSource.query(
      `
        SELECT
          cargo.id AS "cargoId",
          cargo.nome AS "cargoNome",
          candidato.id AS "candidatoId",
          candidato.nome AS "candidatoNome",
          partido.sigla AS "partidoSigla",
          candidatura.id AS "candidaturaId",
          candidatura.numero_eleitoral AS "numeroEleitoral",
          COUNT(voto.id)::text AS "totalVotos"
        FROM "candidaturas" candidatura
        INNER JOIN "cargos" cargo
          ON cargo.id = candidatura.cargo_id
        INNER JOIN "candidatos" candidato
          ON candidato.id = candidatura.candidato_id
        INNER JOIN "partidos" partido
          ON partido.id = candidatura.partido_id
        LEFT JOIN "votos" voto
          ON voto.candidatura_id = candidatura.id
        WHERE candidatura.eleicao_id = $1
          ${filtroCargo}
        GROUP BY
          cargo.id,
          cargo.nome,
          candidato.id,
          candidato.nome,
          partido.sigla,
          candidatura.id,
          candidatura.numero_eleitoral
        ORDER BY
          cargo.nome ASC,
          candidato.nome ASC,
          candidatura.numero_eleitoral ASC
      `,
      parametros,
    );

    return {
      eleicaoId: eleicao.id,
      situacao: eleicao.situacao.nome,
      resultados,
    };
  }
}
