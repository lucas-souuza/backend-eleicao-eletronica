// src/candidatura/candidatura.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Candidatura } from './entities/candidatura.entity';
import { Candidato } from '../candidato/entities/candidato.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Partido } from '../partido/entities/partido.entity';
import { AuthModule } from '../auth/auth.module';
import { CandidaturaController } from './candidatura.controller';
import { CandidaturaService } from './candidatura.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidatura, Candidato, Eleicao, Cargo, Partido]),
    AuthModule,
  ],
  controllers: [CandidaturaController],
  providers: [CandidaturaService],
})
export class CandidaturaModule {}
