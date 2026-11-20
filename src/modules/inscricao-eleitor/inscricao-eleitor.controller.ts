// src/inscricao-eleitor/inscricao-eleitor.controller.ts

import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InscricaoEleitorService } from './inscricao-eleitor.service';
import { InscreverEleitorDto } from './dto/inscrever-eleitor.dto';
import { InscricaoRespostaDto } from './dto/inscricao-resposta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { TAGS } from '../../common/swagger/swagger.constantes';
import {
  ApiAutenticado,
  ApiErroValidacao,
  ApiPerfisPermitidos,
  ApiRespostaErro,
} from '../../common/swagger/api-respostas.decorator';

@ApiTags(TAGS.inscricoes)
@ApiAutenticado()
@ApiPerfisPermitidos(['CHEFE_SECAO'])
@Controller('inscricoes-eleitor')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class InscricaoEleitorController {
  constructor(
    private readonly inscricaoEleitorService: InscricaoEleitorService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Inscrever eleitor em uma eleição',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Só eleitores inscritos podem votar e acompanhar os resultados da eleição. ' +
      'A eleição precisa estar **AGENDADA** e cada eleitor só pode ter uma inscrição.',
  })
  @ApiCreatedResponse({
    description: 'Eleitor inscrito.',
    type: InscricaoRespostaDto,
  })
  @ApiErroValidacao(['eleitorId must match /^[1-9]\\d*$/ regular expression'])
  @ApiRespostaErro(
    HttpStatus.NOT_FOUND,
    'Eleitor ou eleição não existe.',
    'Eleitor não encontrado.',
    'Eleição não encontrada.',
  )
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'Eleição não está agendada ou eleitor já inscrito.',
    'Só é possível inscrever eleitores em uma eleição agendada.',
    'Este eleitor já está inscrito em uma eleição.',
  )
  inscrever(@Body() dto: InscreverEleitorDto) {
    return this.inscricaoEleitorService.inscrever(dto);
  }
}
