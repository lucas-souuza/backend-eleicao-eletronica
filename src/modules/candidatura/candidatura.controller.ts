// src/candidatura/candidatura.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CandidaturaService } from './candidatura.service';
import { CadastrarCandidaturaDto } from './dto/cadastrar-candidatura.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('candidaturas')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Post()
  cadastrar(@Body() dto: CadastrarCandidaturaDto) {
    return this.candidaturaService.cadastrar(dto);
  }
}
