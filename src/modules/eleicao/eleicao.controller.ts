// src/eleicao/eleicao.controller.ts

import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { EleicaoService } from './eleicao.service';
import { CriarEleicaoDto } from './dto/criar-eleicao.dto';
import { EleicaoRespostaDto } from './dto/eleicao-resposta.dto';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfisGuard } from '../auth/guards/perfis.guard';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { PADRAO_ID, TAGS } from '../../common/swagger/swagger.constantes';
import {
  ApiAutenticado,
  ApiErroValidacao,
  ApiPerfisPermitidos,
  ApiRespostaErro,
} from '../../common/swagger/api-respostas.decorator';

const PARAM_ID_ELEICAO = ApiParam({
  name: 'id',
  description: 'ID da eleição.',
  schema: { type: 'string', pattern: PADRAO_ID },
  example: '1',
});

const ERRO_ID_INVALIDO = ApiRespostaErro(
  HttpStatus.BAD_REQUEST,
  'ID da eleição inválido (deve ser um inteiro positivo).',
  'Identificador inválido.',
);

const ERRO_NAO_ENCONTRADA = ApiRespostaErro(
  HttpStatus.NOT_FOUND,
  'Eleição não existe.',
  'Eleição não encontrada.',
);

@ApiTags(TAGS.eleicoes)
@ApiAutenticado()
@ApiPerfisPermitidos(['CHEFE_SECAO'])
@Controller('eleicoes')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class EleicaoController {
  constructor(private readonly eleicaoService: EleicaoService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar eleição',
    description:
      'Perfil permitido: **CHEFE_SECAO**. A eleição é criada com a situação **AGENDADA**.',
  })
  @ApiCreatedResponse({
    description: 'Eleição cadastrada com situação AGENDADA.',
    type: EleicaoRespostaDto,
  })
  @ApiErroValidacao(
    ['turno must not be greater than 2'],
    'O horário de abertura deve ser anterior ao de encerramento.',
  )
  criar(@Body() dto: CriarEleicaoDto) {
    return this.eleicaoService.criar(dto);
  }

  @Patch(':id/abrir')
  @ApiOperation({
    summary: 'Abrir a votação',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Muda a situação de **AGENDADA** para **ABERTA**. A partir daí os eleitores podem votar.',
  })
  @PARAM_ID_ELEICAO
  @ApiOkResponse({
    description: 'Votação aberta.',
    type: EleicaoRespostaDto,
  })
  @ERRO_ID_INVALIDO
  @ERRO_NAO_ENCONTRADA
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'A eleição não está AGENDADA.',
    'Só é possível abrir uma eleição agendada.',
  )
  abrir(@Param('id', ParseBigIntPipe) id: string) {
    return this.eleicaoService.abrir(id);
  }

  @Patch(':id/encerrar')
  @ApiOperation({
    summary: 'Encerrar a votação',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Muda a situação de **ABERTA** para **ENCERRADA**. Nenhum voto novo é aceito depois disso e o resultado final fica disponível.',
  })
  @PARAM_ID_ELEICAO
  @ApiOkResponse({
    description: 'Votação encerrada.',
    type: EleicaoRespostaDto,
  })
  @ERRO_ID_INVALIDO
  @ERRO_NAO_ENCONTRADA
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'A eleição não está ABERTA.',
    'Só é possível encerrar uma eleição aberta.',
  )
  encerrar(@Param('id', ParseBigIntPipe) id: string) {
    return this.eleicaoService.encerrar(id);
  }
}
