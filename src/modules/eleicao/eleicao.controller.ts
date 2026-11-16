// src/eleicao/eleicao.controller.ts

import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { EleicaoService } from './eleicao.service';
import { CriarEleicaoDto } from './dto/criar-eleicao.dto';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';

@Controller('eleicoes')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class EleicaoController {
  constructor(private readonly eleicaoService: EleicaoService) {}

  @Post()
  criar(@Body() dto: CriarEleicaoDto) {
    return this.eleicaoService.criar(dto);
  }

  @Patch(':id/abrir')
  abrir(@Param('id', ParseBigIntPipe) id: string) {
    return this.eleicaoService.abrir(id);
  }

  @Patch(':id/encerrar')
  encerrar(@Param('id', ParseBigIntPipe) id: string) {
    return this.eleicaoService.encerrar(id);
  }
}
