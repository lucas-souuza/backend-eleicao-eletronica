// src/candidato/candidato.controller.ts

import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CandidatoService } from './candidato.service';
import { CadastrarCandidatoDto } from './dto/cadastrar-candidato.dto';
import { CandidatoRespostaDto } from './dto/candidato-resposta.dto';
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

@ApiTags(TAGS.candidatos)
@ApiAutenticado()
@ApiPerfisPermitidos(['CHEFE_SECAO'])
@Controller('candidatos')
@UseGuards(JwtAuthGuard, PerfisGuard)
@Perfis('CHEFE_SECAO')
export class CandidatoController {
  constructor(private readonly candidatoService: CandidatoService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar candidato',
    description:
      'Perfil permitido: **CHEFE_SECAO**. Cria o usuário (perfil CANDIDATO) e os dados do candidato na mesma transação. ' +
      'Depois, use **POST /candidaturas** para associar o candidato a uma eleição, um cargo e um partido.',
  })
  @ApiCreatedResponse({
    description: 'Candidato cadastrado.',
    type: CandidatoRespostaDto,
  })
  @ApiErroValidacao(['CPF deve conter 11 números.'])
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'E-mail ou CPF já cadastrado.',
    'Já existe um usuário com esse e-mail ou um candidato com esse CPF.',
  )
  cadastrar(@Body() dto: CadastrarCandidatoDto) {
    return this.candidatoService.cadastrar(dto);
  }
}
