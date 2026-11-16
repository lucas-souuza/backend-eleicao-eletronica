// src/candidato/candidato.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CandidatoService } from './candidato.service';
import { CadastrarCandidatoDto } from './dto/cadastrar-candidato.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('candidatos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class CandidatoController {
  constructor(private readonly candidatoService: CandidatoService) {}

  @Post()
  cadastrar(@Body() dto: CadastrarCandidatoDto) {
    return this.candidatoService.cadastrar(dto);
  }
}
