// src/voto/voto.service.ts

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { InscricaoEleitor } from '../inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { ControleVotacao } from '../controle-votacao/entities/controle-votacao.entity';
import { Voto } from './entities/voto.entity';
import { RegistrarVotoDto } from './dto/registrar-voto.dto';

@Injectable()
export class VotoService {
  constructor(private readonly dataSource: DataSource) {}

  async registrarVoto(
    usuarioId: string,
    dto: RegistrarVotoDto,
  ): Promise<{ registrado: true }> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const eleitorRepository = manager.getRepository(Eleitor);
        const eleicaoRepository = manager.getRepository(Eleicao);
        const inscricaoRepository = manager.getRepository(InscricaoEleitor);
        const candidaturaRepository = manager.getRepository(Candidatura);
        const controleRepository = manager.getRepository(ControleVotacao);
        const votoRepository = manager.getRepository(Voto);

        const eleitor = await eleitorRepository.findOne({
          where: { usuario: { id: usuarioId } },
        });

        if (!eleitor) {
          throw new ForbiddenException('Usuário não é um eleitor.');
        }

        const eleicao = await eleicaoRepository.findOne({
          where: { id: dto.eleicaoId },
          relations: { situacao: true },
        });

        if (!eleicao) {
          throw new NotFoundException('Eleição não encontrada.');
        }

        if (eleicao.situacao.nome !== 'ABERTA') {
          throw new ConflictException('A eleição não está aberta.');
        }

        const inscricao = await inscricaoRepository.findOne({
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

        const candidatura = await candidaturaRepository.findOne({
          where: {
            id: dto.candidaturaId,
            eleicao: { id: eleicao.id },
            cargo: { id: dto.cargoId },
          },
        });

        if (!candidatura) {
          throw new NotFoundException(
            'Candidatura não pertence a esta eleição e cargo.',
          );
        }

        // A constraint UNIQUE em eleitor + eleição + cargo
        // é a proteção definitiva contra votos duplicados concorrentes.
        const controle = controleRepository.create({
          eleitor,
          eleicao,
          cargo: { id: dto.cargoId },
        });

        await controleRepository.save(controle);

        // Voto contém somente a candidatura; não associa o voto ao eleitor.
        const voto = votoRepository.create({ candidatura });
        await votoRepository.save(voto);
      });

      // Não devolvemos a entity Voto nem a candidatura escolhida.
      return { registrado: true };
    } catch (erro) {
      if (erro instanceof QueryFailedError) {
        const erroPostgres = erro.driverError as {
          code?: string;
          constraint?: string;
        };

        if (
          erroPostgres.code === '23505' &&
          erroPostgres.constraint === 'UQ_controle_eleitor_eleicao_cargo'
        ) {
          throw new ConflictException(
            'Já existe um voto registrado para este cargo nesta eleição.',
          );
        }
      }

      throw erro;
    }
  }
}
