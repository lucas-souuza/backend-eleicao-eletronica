// src/eleicao/eleicao.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Eleicao } from './entities/eleicao.entity';
import { SituacaoEleicao } from '../situacao-eleicao/entities/situacao-eleicao.entity';
import { EleicaoController } from './eleicao.controller';
import { EleicaoService } from './eleicao.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Eleicao, SituacaoEleicao]), AuthModule],
  controllers: [EleicaoController],
  providers: [EleicaoService],
})
export class EleicaoModule {}
