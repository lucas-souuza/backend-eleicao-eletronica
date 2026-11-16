// src/partido/partido.controller.ts

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { PartidoService } from './partido.service';
import { CadastrarPartidoDto } from './dto/cadastrar-partido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('partidos')
@UseGuards(JwtAuthGuard)
export class PartidoController {
  constructor(private readonly partidoService: PartidoService) {}

  @Get()
  listar() {
    return this.partidoService.listar();
  }

  @Post()
  @UseGuards(PerfisGuard)
  @Perfis('CHEFE_SECAO')
  cadastrar(@Body() dto: CadastrarPartidoDto) {
    return this.partidoService.cadastrar(dto);
  }
}
