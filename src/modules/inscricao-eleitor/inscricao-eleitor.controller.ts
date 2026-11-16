// src/inscricao-eleitor/inscricao-eleitor.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { InscricaoEleitorService } from './inscricao-eleitor.service';
import { InscreverEleitorDto } from './dto/inscrever-eleitor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('inscricoes-eleitor')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class InscricaoEleitorController {
  constructor(
    private readonly inscricaoEleitorService: InscricaoEleitorService,
  ) {}

  @Post()
  inscrever(@Body() dto: InscreverEleitorDto) {
    return this.inscricaoEleitorService.inscrever(dto);
  }
}
