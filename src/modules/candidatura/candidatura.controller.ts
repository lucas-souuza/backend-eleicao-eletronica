// src/candidatura/candidatura.controller.ts

import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CandidaturaService } from './candidatura.service';
import { CadastrarCandidaturaDto } from './dto/cadastrar-candidatura.dto';
import { CandidaturaRespostaDto } from './dto/candidatura-resposta.dto';
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

@ApiTags(TAGS.candidaturas)
@ApiAutenticado()
@ApiPerfisPermitidos(['CHEFE_SECAO'])
@Controller('candidaturas')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar candidatura',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Associa um candidato a uma eleição, um cargo e um partido, com o número de urna. ' +
      'Só é possível em eleições **AGENDADAS**. Cada candidato tem no máximo uma candidatura por eleição.',
  })
  @ApiCreatedResponse({
    description: 'Candidatura cadastrada.',
    type: CandidaturaRespostaDto,
  })
  @ApiErroValidacao(['numeroEleitoral deve ter de 1 a 10 dígitos.'])
  @ApiRespostaErro(
    HttpStatus.NOT_FOUND,
    'Candidato, eleição, cargo ou partido não existe.',
    'Candidato não encontrado.',
    'Eleição não encontrada.',
    'Cargo não encontrado.',
    'Partido não encontrado.',
  )
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'Eleição não está agendada, candidato já concorre nesta eleição ou número já usado no cargo.',
    'Só é possível cadastrar candidaturas em eleições agendadas.',
    'Esse candidato já possui candidatura nesta eleição.',
    'Esse número eleitoral já está em uso para este cargo nesta eleição.',
  )
  cadastrar(@Body() dto: CadastrarCandidaturaDto) {
    return this.candidaturaService.cadastrar(dto);
  }
}
