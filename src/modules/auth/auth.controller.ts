// src/autenticacao/autenticacao.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  LoginRespostaDto,
  UsuarioAtualRespostaDto,
} from './dto/auth-resposta.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TAGS } from '../../common/swagger/swagger.constantes';
import {
  ApiAutenticado,
  ApiErroValidacao,
  ApiRespostaErro,
} from '../../common/swagger/api-respostas.decorator';

type RequisicaoAutenticada = Request & {
  user: {
    sub: string;
    perfil: string;
  };
};

@ApiTags(TAGS.autenticacao)
@Controller('auth')
export class AuthController {
  constructor(private readonly autenticacaoService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Rota pública. Valida e-mail e senha e devolve um token JWT com o ID e o perfil do usuário (CHEFE_SECAO, ELEITOR ou CANDIDATO).',
  })
  @ApiOkResponse({
    description: 'Login realizado. Use o access_token no botão Authorize.',
    type: LoginRespostaDto,
  })
  @ApiErroValidacao([
    'email must be an email',
    'senha must be longer than or equal to 8 characters',
  ])
  @ApiRespostaErro(
    HttpStatus.UNAUTHORIZED,
    'E-mail ou senha incorretos.',
    'E-mail ou senha inválidos.',
  )
  entrar(@Body() dto: LoginDto) {
    return this.autenticacaoService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar o usuário autenticado',
    description:
      'Devolve o ID e o perfil contidos no token. Útil para conferir com qual perfil você está logado.',
  })
  @ApiAutenticado()
  @ApiOkResponse({
    description: 'Dados do usuário do token.',
    type: UsuarioAtualRespostaDto,
  })
  usuarioAtual(@Req() requisicao: RequisicaoAutenticada) {
    return {
      usuarioId: requisicao.user.sub,
      perfil: requisicao.user.perfil,
    };
  }
}
