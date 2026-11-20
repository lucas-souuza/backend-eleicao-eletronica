// src/eleicao/dto/eleicao-resposta.dto.ts
// Formato de resposta do módulo de eleições (usado no Swagger).

import { ApiProperty } from '@nestjs/swagger';

import { SITUACOES_ELEICAO } from '../../../common/swagger/swagger.constantes';

export class EleicaoRespostaDto {
  @ApiProperty({ description: 'ID da eleição.', example: '1' })
  id!: string;

  @ApiProperty({
    description: 'Data da eleição.',
    format: 'date',
    example: '2026-12-06',
  })
  dataEleicao!: string;

  @ApiProperty({ description: 'Turno da eleição.', example: 1 })
  turno!: number;

  @ApiProperty({
    description: 'Horário de abertura da votação.',
    example: '08:00:00',
  })
  horarioAbertura!: string;

  @ApiProperty({
    description: 'Horário de encerramento da votação.',
    example: '17:00:00',
  })
  horarioEncerramento!: string;

  @ApiProperty({
    description: 'Situação atual da eleição.',
    enum: SITUACOES_ELEICAO,
    example: 'AGENDADA',
  })
  situacao!: string;

  @ApiProperty({
    description: 'Data e hora do cadastro.',
    format: 'date-time',
    example: '2026-11-20T19:30:00.000Z',
  })
  criadoEm!: Date;
}
