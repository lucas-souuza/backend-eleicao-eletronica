// src/eleicao/dto/criar-eleicao.dto.ts

import { IsDateString, IsInt, Matches, Max, Min } from 'class-validator';

const REGEX_HORARIO = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export class CriarEleicaoDto {
  @IsDateString()
  dataEleicao!: string;

  @IsInt()
  @Min(1)
  @Max(2)
  turno!: number;

  @Matches(REGEX_HORARIO, {
    message: 'horarioAbertura deve estar no formato HH:mm ou HH:mm:ss.',
  })
  horarioAbertura!: string;

  @Matches(REGEX_HORARIO, {
    message: 'horarioEncerramento deve estar no formato HH:mm ou HH:mm:ss.',
  })
  horarioEncerramento!: string;
}
