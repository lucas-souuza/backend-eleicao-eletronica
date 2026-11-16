// src/inscricao-eleitor/inscricao-eleitor.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { InscricaoEleitor } from './entities/inscricao-eleitor.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { InscreverEleitorDto } from './dto/inscrever-eleitor.dto';

@Injectable()
export class InscricaoEleitorService {
  constructor(
    @InjectRepository(InscricaoEleitor)
    private readonly inscricaoRepository: Repository<InscricaoEleitor>,

    @InjectRepository(Eleitor)
    private readonly eleitorRepository: Repository<Eleitor>,

    @InjectRepository(Eleicao)
    private readonly eleicaoRepository: Repository<Eleicao>,
  ) {}

  async inscrever(dto: InscreverEleitorDto) {
    const eleitor = await this.eleitorRepository.findOneBy({
      id: dto.eleitorId,
    });

    if (!eleitor) {
      throw new NotFoundException('Eleitor não encontrado.');
    }

    const eleicao = await this.eleicaoRepository.findOne({
      where: { id: dto.eleicaoId },
      relations: { situacao: true },
    });

    if (!eleicao) {
      throw new NotFoundException('Eleição não encontrada.');
    }

    if (eleicao.situacao.nome !== 'AGENDADA') {
      throw new ConflictException(
        'Só é possível inscrever eleitores em uma eleição agendada.',
      );
    }

    try {
      const inscricao = this.inscricaoRepository.create({
        eleitor,
        eleicao,
      });

      const salva = await this.inscricaoRepository.save(inscricao);

      return {
        id: salva.id,
        eleitorId: eleitor.id,
        eleicaoId: eleicao.id,
        inscritoEm: salva.inscritoEm,
      };
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (
          erro.driverError as {
            code?: string;
            constraint?: string;
          }
        ).code === '23505' &&
        (erro.driverError as { constraint?: string }).constraint ===
          'UQ_inscricao_eleitor'
      ) {
        throw new ConflictException(
          'Este eleitor já está inscrito em uma eleição.',
        );
      }

      throw erro;
    }
  }
}
