// src/eleitor/eleitor.controller.ts

import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { EleitorService } from './eleitor.service';
import { CadastrarEleitorDto } from './dto/cadastrar-eleitor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('eleitores')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class EleitorController {
  constructor(private readonly eleitorService: EleitorService) {}

  @Post()
  @Perfis('CHEFE_SECAO')
  cadastrar(@Body() dto: CadastrarEleitorDto) {
    return this.eleitorService.cadastrar(dto);
  }
}
