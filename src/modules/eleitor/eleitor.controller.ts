// src/eleitor/eleitor.controller.ts

import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { EleitorService } from './eleitor.service';
import { CadastrarEleitorDto } from './dto/cadastrar-eleitor.dto';
import { EleitorRespostaDto } from './dto/eleitor-resposta.dto';
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

@ApiTags(TAGS.eleitores)
@ApiAutenticado()
@Controller('eleitores')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class EleitorController {
  constructor(private readonly eleitorService: EleitorService) {}

  @Post()
  @Perfis('CHEFE_SECAO')
  @ApiOperation({
    summary: 'Cadastrar eleitor',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Cria o usuário (perfil ELEITOR) e os dados do eleitor na mesma transação. ' +
      'Depois, use **POST /inscricoes-eleitor** para inscrever o eleitor em uma eleição.',
  })
  @ApiCreatedResponse({
    description: 'Eleitor cadastrado.',
    type: EleitorRespostaDto,
  })
  @ApiErroValidacao(['Título eleitoral deve conter 12 números.'])
  @ApiPerfisPermitidos(['CHEFE_SECAO'])
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'E-mail, CPF ou título já cadastrado.',
    'Já existe um usuário com esse e-mail, CPF ou título eleitoral.',
  )
  cadastrar(@Body() dto: CadastrarEleitorDto) {
    return this.eleitorService.cadastrar(dto);
  }
}
