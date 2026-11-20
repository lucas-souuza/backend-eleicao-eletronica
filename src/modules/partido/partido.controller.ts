// src/partido/partido.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { PartidoService } from './partido.service';
import { CadastrarPartidoDto } from './dto/cadastrar-partido.dto';
import { PartidoRespostaDto } from './dto/partido-resposta.dto';
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

@ApiTags(TAGS.partidos)
@ApiAutenticado()
@Controller('partidos')
@UseGuards(JwtAuthGuard)
export class PartidoController {
  constructor(private readonly partidoService: PartidoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar partidos',
    description:
      'Qualquer usuário autenticado pode consultar. A lista vem ordenada pela sigla.',
  })
  @ApiOkResponse({
    description: 'Lista de partidos cadastrados.',
    type: [PartidoRespostaDto],
  })
  listar() {
    return this.partidoService.listar();
  }

  @Post()
  @UseGuards(PerfisGuard)
  @Perfis('CHEFE_SECAO')
  @ApiOperation({
    summary: 'Cadastrar partido',
    description: 'Perfil permitido: **CHEFE_SECAO**.',
  })
  @ApiCreatedResponse({
    description: 'Partido cadastrado.',
    type: PartidoRespostaDto,
  })
  @ApiErroValidacao(
    ['sigla must be longer than or equal to 1 characters'],
    'Nome e sigla são obrigatórios.',
  )
  @ApiPerfisPermitidos(['CHEFE_SECAO'])
  @ApiRespostaErro(
    HttpStatus.CONFLICT,
    'Sigla já cadastrada.',
    'Já existe um partido cadastrado com essa sigla.',
  )
  cadastrar(@Body() dto: CadastrarPartidoDto) {
    return this.partidoService.cadastrar(dto);
  }
}
