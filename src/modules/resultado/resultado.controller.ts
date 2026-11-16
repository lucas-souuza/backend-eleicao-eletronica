// src/resultado/resultado.controller.ts

import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { ResultadoService } from './resultado.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';

type RequisicaoAutenticada = Request & {
  user: {
    sub: string;
    perfil: 'ELEITOR' | 'CANDIDATO';
  };
};

@Controller('eleicoes')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('ELEITOR', 'CANDIDATO')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @Get(':eleicaoId/resultados')
  consultar(
    @Param('eleicaoId', ParseBigIntPipe) eleicaoId: string,
    @Req() requisicao: RequisicaoAutenticada,
  ) {
    return this.resultadoService.consultar(
      eleicaoId,
      requisicao.user.sub,
      requisicao.user.perfil,
    );
  }
}
