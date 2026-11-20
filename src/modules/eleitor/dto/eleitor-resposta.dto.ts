// src/eleitor/dto/eleitor-resposta.dto.ts
// Formato de resposta do módulo de eleitores (usado no Swagger).
// Senha, CPF, título e telefone não são devolvidos pela API.

import { ApiProperty } from '@nestjs/swagger';

export class EleitorRespostaDto {
  @ApiProperty({ description: 'Nome do eleitor.', example: 'João Souza' })
  nome!: string;

  @ApiProperty({
    description: 'E-mail de login do eleitor.',
    example: 'joao.souza@eleicao.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Data e hora do cadastro.',
    format: 'date-time',
    example: '2026-11-20T19:30:00.000Z',
  })
  criadoEm!: Date;
}
