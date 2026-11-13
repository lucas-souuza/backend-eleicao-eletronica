import { Module } from '@nestjs/common';
import { PartidoService } from './partido.service';

@Module({
  providers: [PartidoService]
})
export class PartidoModule {}
