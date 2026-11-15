import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Candidatura } from './entities/candidatura.entity';
import { Partido } from '../partido/entities/partido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidatura, Cargo, Partido])],
})
export class CandidaturaModule {}
