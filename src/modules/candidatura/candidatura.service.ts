// src/candidatura/candidatura.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { Candidatura } from './entities/candidatura.entity';
import { Candidato } from '../candidato/entities/candidato.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Partido } from '../partido/entities/partido.entity';
import { CadastrarCandidaturaDto } from './dto/cadastrar-candidatura.dto';

@Injectable()
export class CandidaturaService {
  constructor(private readonly dataSource: DataSource) {}

  async cadastrar(dto: CadastrarCandidaturaDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const candidato = await manager
          .getRepository(Candidato)
          .findOneBy({ id: dto.candidatoId });

        if (!candidato) {
          throw new NotFoundException('Candidato não encontrado.');
        }

        const eleicao = await manager.getRepository(Eleicao).findOne({
          where: { id: dto.eleicaoId },
          relations: { situacao: true },
        });

        if (!eleicao) {
          throw new NotFoundException('Eleição não encontrada.');
        }

        if (eleicao.situacao.nome !== 'AGENDADA') {
          throw new ConflictException(
            'Só é possível cadastrar candidaturas em eleições agendadas.',
          );
        }

        const cargo = await manager
          .getRepository(Cargo)
          .findOneBy({ id: dto.cargoId });

        if (!cargo) {
          throw new NotFoundException('Cargo não encontrado.');
        }

        const partido = await manager
          .getRepository(Partido)
          .findOneBy({ id: dto.partidoId });

        if (!partido) {
          throw new NotFoundException('Partido não encontrado.');
        }

        const candidaturaRepository = manager.getRepository(Candidatura);

        const candidatura = candidaturaRepository.create({
          candidato,
          eleicao,
          cargo,
          partido,
          numeroEleitoral: dto.numeroEleitoral,
        });

        const salva = await candidaturaRepository.save(candidatura);

        return {
          id: salva.id,
          candidatoId: candidato.id,
          eleicaoId: eleicao.id,
          cargoId: cargo.id,
          partidoId: partido.id,
          numeroEleitoral: salva.numeroEleitoral,
        };
      });
    } catch (erro) {
      if (erro instanceof QueryFailedError) {
        const erroPostgres = erro.driverError as {
          code?: string;
          constraint?: string;
        };

        if (
          erroPostgres.code === '23505' &&
          erroPostgres.constraint === 'UQ_candidatura_candidato_eleicao'
        ) {
          throw new ConflictException(
            'Esse candidato já possui candidatura nesta eleição.',
          );
        }

        if (
          erroPostgres.code === '23505' &&
          erroPostgres.constraint === 'UQ_candidatura_eleicao_cargo_numero'
        ) {
          throw new ConflictException(
            'Esse número eleitoral já está em uso para este cargo nesta eleição.',
          );
        }
      }

      // As exceções de regra de negócio são repassadas sem alteração.
      if (
        erro instanceof NotFoundException ||
        erro instanceof ConflictException
      ) {
        throw erro;
      }

      throw erro;
    }
  }
}
