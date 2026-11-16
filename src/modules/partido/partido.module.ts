import { Module } from '@nestjs/common';
import { PartidoService } from './partido.service';
import { PartidoController } from './partido.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partido } from './entities/partido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partido])],
  providers: [PartidoService],
  controllers: [PartidoController],
})
export class PartidoModule {}
