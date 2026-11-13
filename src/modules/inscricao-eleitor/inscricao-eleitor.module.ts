import { Module } from '@nestjs/common';
import { InscricaoEleitorService } from './inscricao-eleitor.service';

@Module({
  providers: [InscricaoEleitorService]
})
export class InscricaoEleitorModule {}
