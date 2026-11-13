import { Module } from '@nestjs/common';
import { EleicaoService } from './eleicao.service';

@Module({
  providers: [EleicaoService]
})
export class EleicaoModule {}
