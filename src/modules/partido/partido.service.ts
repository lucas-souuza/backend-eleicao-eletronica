// src/partido/partido.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Partido } from './entities/partido.entity';
import { CadastrarPartidoDto } from './dto/cadastrar-partido.dto';

@Injectable()
export class PartidoService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidoRepository: Repository<Partido>,
  ) {}

  async cadastrar(dto: CadastrarPartidoDto) {
    const nome = dto.nome.trim();
    const sigla = dto.sigla.trim().toUpperCase();

    if (!nome || !sigla) {
      throw new BadRequestException('Nome e sigla são obrigatórios.');
    }

    try {
      const partido = this.partidoRepository.create({ nome, sigla });
      const salvo = await this.partidoRepository.save(partido);

      return {
        id: salvo.id,
        nome: salvo.nome,
        sigla: salvo.sigla,
      };
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Já existe um partido cadastrado com essa sigla.',
        );
      }

      throw erro;
    }
  }

  listar() {
    return this.partidoRepository.find({
      select: { id: true, nome: true, sigla: true },
      order: { sigla: 'ASC' },
    });
  }
}
