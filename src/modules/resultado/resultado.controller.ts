// src/resultado/resultado.controller.ts

import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ResultadoService } from './resultado.service';
import { ResultadoRespostaDto } from './dto/resultado-resposta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { PADRAO_ID, TAGS } from '../../common/swagger/swagger.constantes';
import {
  ApiAutenticado,
  ApiPerfisPermitidos,
  ApiRespostaErro,
} from '../../common/swagger/api-respostas.decorator';

type RequisicaoAutenticada = Request & {
  user: {
    sub: string;
    perfil: 'ELEITOR' | 'CANDIDATO';
  };
};

@ApiTags(TAGS.resultados)
@ApiAutenticado()
@Controller('eleicoes')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('ELEITOR', 'CANDIDATO')
export class ResultadoController {
  constructor(private readonly resultadoService: ResultadoService) {}

  @Get(':eleicaoId/resultados')
  @ApiOperation({
    summary: 'Consultar resultados da eleição',
    description:
      'Perfis permitidos: **ELEITOR** e **CANDIDATO**.\n\n' +
      '- Com a eleição **ABERTA**, mostra a apuração parcial (acompanhamento da votação).\n' +
      '- Com a eleição **ENCERRADA**, mostra o resultado final.\n' +
      '- O **ELEITOR** precisa estar inscrito na eleição e vê todos os cargos.\n' +
      '- O **CANDIDATO** precisa concorrer na eleição e vê apenas o próprio cargo.\n\n' +
      'Não há dados de quem votou em quem (sigilo do voto).',
  })
  @ApiParam({
    name: 'eleicaoId',
    description: 'ID da eleição.',
    schema: { type: 'string', pattern: PADRAO_ID },
    example: '1',
  })
  @ApiOkResponse({
    description: 'Contagem de votos por candidatura.',
    type: ResultadoRespostaDto,
  })
  @ApiRespostaErro(
    HttpStatus.BAD_REQUEST,
    'ID da eleição inválido (deve ser um inteiro positivo).',
    'Identificador inválido.',
  )
  @ApiPerfisPermitidos(
    ['ELEITOR', 'CANDIDATO'],
    'Eleitor não está inscrito nesta eleição.',
    'Candidato não concorre nesta eleição.',
  )
  @ApiRespostaErro(
    HttpStatus.NOT_FOUND,
    'Eleição não existe.',
    'Eleição não encontrada.',
  )
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'A eleição ainda está AGENDADA.',
    'Os resultados ficam disponíveis quando a eleição abre.',
  )
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
