import { Module } from '@nestjs/common';
import { EleicaoService } from './eleicao.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SituacaoEleicao } from '../situacao-eleicao/entities/situacao-eleicao.entity';
import { Eleicao } from './entities/eleicao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Eleicao, SituacaoEleicao])],
  providers: [EleicaoService],
})
export class EleicaoModule {}
