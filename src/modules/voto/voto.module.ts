// src/voto/voto.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Voto } from './entities/voto.entity';
import { VotoService } from './voto.service';
import { ControleVotacao } from '../controle-votacao/entities/controle-votacao.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { InscricaoEleitor } from '../inscricao-eleitor/entities/inscricao-eleitor.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { VotoController } from './voto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voto,
      ControleVotacao,
      Eleitor,
      Eleicao,
      InscricaoEleitor,
      Candidatura,
    ]),
  ],
  providers: [VotoService],
  exports: [VotoService],
  controllers: [VotoController],
})
export class VotoModule {}
