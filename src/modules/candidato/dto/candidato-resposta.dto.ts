// src/candidato/dto/candidato-resposta.dto.ts
// Formato de resposta do módulo de candidatos (usado no Swagger).
// Senha, CPF e telefone não são devolvidos pela API.

import { ApiProperty } from '@nestjs/swagger';

export class CandidatoRespostaDto {
  @ApiProperty({
    description: 'ID do candidato. Usado no cadastro da candidatura.',
    example: '1',
  })
  id!: string;

  @ApiProperty({ description: 'Nome do candidato.', example: 'Maria Oliveira' })
  nome!: string;

  @ApiProperty({
    description: 'E-mail de login do candidato.',
    example: 'maria.oliveira@eleicao.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Data e hora do cadastro.',
    format: 'date-time',
    example: '2026-11-20T19:30:00.000Z',
  })
  criadoEm!: Date;
}
