// src/voto/voto.controller.ts

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { VotoService } from './voto.service';
import { RegistrarVotoDto } from './dto/registrar-voto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

type RequisicaoAutenticada = Request & {
  user: { sub: string; perfil: string };
};

@Controller('votos')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class VotoController {
  constructor(private readonly votoService: VotoService) {}

  @Post()
  @Perfis('ELEITOR')
  registrar(
    @Req() requisicao: RequisicaoAutenticada,
    @Body() dto: RegistrarVotoDto,
  ) {
    return this.votoService.registrarVoto(requisicao.user.sub, dto);
  }
}
