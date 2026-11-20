// src/voto/voto.controller.ts

import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { VotoService } from './voto.service';
import { RegistrarVotoDto } from './dto/registrar-voto.dto';
import { VotoRespostaDto } from './dto/voto-resposta.dto';
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

type RequisicaoAutenticada = Request & {
  user: { sub: string; perfil: string };
};

@ApiTags(TAGS.votacao)
@ApiAutenticado()
@Controller('votos')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class VotoController {
  constructor(private readonly votoService: VotoService) {}

  @Post()
  @Perfis('ELEITOR')
  @ApiOperation({
    summary: 'Registrar voto',
    description:
      'Perfil permitido: **ELEITOR**. O eleitor é identificado pelo token. Regras:\n\n' +
      '- a eleição precisa estar **ABERTA**;\n' +
      '- o eleitor precisa estar inscrito na eleição;\n' +
      '- só é permitido **um voto por cargo** em cada eleição;\n' +
      '- depois de registrado, o voto não pode ser alterado.\n\n' +
      'O voto é gravado sem ligação com o eleitor (sigilo do voto).',
  })
  @ApiCreatedResponse({
    description: 'Voto registrado.',
    type: VotoRespostaDto,
  })
  @ApiErroValidacao([
    'candidaturaId must match /^[1-9]\\d*$/ regular expression',
  ])
  @ApiPerfisPermitidos(
    ['ELEITOR'],
    'Usuário não é um eleitor.',
    'Eleitor não está inscrito nesta eleição.',
  )
  @ApiRespostaErro(
    HttpStatus.NOT_FOUND,
    'Eleição não existe ou a candidatura não pertence à eleição/cargo.',
    'Eleição não encontrada.',
    'Candidatura não pertence a esta eleição e cargo.',
  )
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'Eleição não está aberta ou o eleitor já votou neste cargo.',
    'A eleição não está aberta.',
    'Já existe um voto registrado para este cargo nesta eleição.',
  )
  registrar(
    @Req() requisicao: RequisicaoAutenticada,
    @Body() dto: RegistrarVotoDto,
  ) {
    return this.votoService.registrarVoto(requisicao.user.sub, dto);
  }
}
