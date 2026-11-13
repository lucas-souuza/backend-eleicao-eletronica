import { Module } from '@nestjs/common';
import { CandidatoService } from './candidato.service';
import { Candidato } from './entities/candidato.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Candidato])],
  providers: [CandidatoService],
})
export class CandidatoModule {}
