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
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type RequisicaoAutenticada = Request & {
  user: {
    sub: string;
    perfil: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly autenticacaoService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  entrar(@Body() dto: LoginDto) {
    return this.autenticacaoService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  usuarioAtual(@Req() requisicao: RequisicaoAutenticada) {
    return {
      usuarioId: requisicao.user.sub,
      perfil: requisicao.user.perfil,
    };
  }
}
