import { Module } from '@nestjs/common';
import { ControleVotacaoService } from './controle-votacao.service';

@Module({
  providers: [ControleVotacaoService]
})
export class ControleVotacaoModule {}
