import { Module } from '@nestjs/common';
import { CandidatoService } from './candidato.service';
import { Candidato } from './entities/candidato.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoController } from './candidato.controller';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Perfil } from '../perfil/entities/perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidato, Usuario, Perfil])],
  providers: [CandidatoService],
  controllers: [CandidatoController],
})
export class CandidatoModule {}
