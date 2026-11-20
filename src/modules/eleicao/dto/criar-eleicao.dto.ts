// src/eleicao/dto/criar-eleicao.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Matches, Max, Min } from 'class-validator';

const REGEX_HORARIO = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export class CriarEleicaoDto {
  @ApiProperty({
    description: 'Data da eleição (formato ISO 8601, AAAA-MM-DD).',
    format: 'date',
    example: '2026-12-06',
  })
  @IsDateString()
  dataEleicao!: string;

  @ApiProperty({
    description: 'Turno da eleição (1 ou 2).',
    minimum: 1,
    maximum: 2,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(2)
  turno!: number;

  @ApiProperty({
    description: 'Horário de abertura da votação (HH:mm ou HH:mm:ss).',
    pattern: REGEX_HORARIO.source,
    example: '08:00',
  })
  @Matches(REGEX_HORARIO, {
    message: 'horarioAbertura deve estar no formato HH:mm ou HH:mm:ss.',
  })
  horarioAbertura!: string;

  @ApiProperty({
    description:
      'Horário de encerramento da votação (HH:mm ou HH:mm:ss). Deve ser depois do horário de abertura.',
    pattern: REGEX_HORARIO.source,
    example: '17:00',
  })
  @Matches(REGEX_HORARIO, {
    message: 'horarioEncerramento deve estar no formato HH:mm ou HH:mm:ss.',
  })
  horarioEncerramento!: string;
}
