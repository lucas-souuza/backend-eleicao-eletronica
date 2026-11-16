// src/eleicao/eleicao.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Eleicao } from './entities/eleicao.entity';
import { SituacaoEleicao } from '../situacao-eleicao/entities/situacao-eleicao.entity';
import { CriarEleicaoDto } from './dto/criar-eleicao.dto';

@Injectable()
export class EleicaoService {
  constructor(
    @InjectRepository(Eleicao)
    private readonly eleicaoRepository: Repository<Eleicao>,

    @InjectRepository(SituacaoEleicao)
    private readonly situacaoRepository: Repository<SituacaoEleicao>,
  ) {}

  async criar(dto: CriarEleicaoDto) {
    if (
      this.converterHorario(dto.horarioAbertura) >=
      this.converterHorario(dto.horarioEncerramento)
    ) {
      throw new BadRequestException(
        'O horário de abertura deve ser anterior ao de encerramento.',
      );
    }

    const situacaoAgendada = await this.buscarSituacao('AGENDADA');

    const eleicao = this.eleicaoRepository.create({
      dataEleicao: dto.dataEleicao,
      turno: dto.turno,
      horarioAbertura: dto.horarioAbertura,
      horarioEncerramento: dto.horarioEncerramento,
      situacao: situacaoAgendada,
    });

    const salva = await this.eleicaoRepository.save(eleicao);
    return this.formatarResposta(salva);
  }

  async abrir(id: string) {
    const eleicao = await this.buscarEleicao(id);

    if (eleicao.situacao.nome !== 'AGENDADA') {
      throw new ConflictException('Só é possível abrir uma eleição agendada.');
    }

    eleicao.situacao = await this.buscarSituacao('ABERTA');

    const salva = await this.eleicaoRepository.save(eleicao);
    return this.formatarResposta(salva);
  }

  async encerrar(id: string) {
    const eleicao = await this.buscarEleicao(id);

    if (eleicao.situacao.nome !== 'ABERTA') {
      throw new ConflictException('Só é possível encerrar uma eleição aberta.');
    }

    eleicao.situacao = await this.buscarSituacao('ENCERRADA');

    const salva = await this.eleicaoRepository.save(eleicao);
    return this.formatarResposta(salva);
  }

  private async buscarEleicao(id: string): Promise<Eleicao> {
    if (!/^[1-9]\d*$/.test(id)) {
      throw new BadRequestException('Identificador de eleição inválido.');
    }

    const eleicao = await this.eleicaoRepository.findOne({
      where: { id },
      relations: { situacao: true },
    });

    if (!eleicao) {
      throw new NotFoundException('Eleição não encontrada.');
    }

    return eleicao;
  }

  private async buscarSituacao(nome: string): Promise<SituacaoEleicao> {
    const situacao = await this.situacaoRepository.findOneBy({ nome });

    if (!situacao) {
      throw new InternalServerErrorException(
        `Situação ${nome} não encontrada. Confira a migration de dados iniciais.`,
      );
    }

    return situacao;
  }

  private converterHorario(horario: string): number {
    const [horas, minutos, segundos = '0'] = horario.split(':');

    return Number(horas) * 3600 + Number(minutos) * 60 + Number(segundos);
  }

  private formatarResposta(eleicao: Eleicao) {
    return {
      id: eleicao.id,
      dataEleicao: eleicao.dataEleicao,
      turno: eleicao.turno,
      horarioAbertura: eleicao.horarioAbertura,
      horarioEncerramento: eleicao.horarioEncerramento,
      situacao: eleicao.situacao.nome,
      criadoEm: eleicao.criadoEm,
    };
  }
}
