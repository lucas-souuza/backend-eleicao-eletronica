// src/voto/dto/registrar-voto.dto.ts

import { IsString, Matches } from 'class-validator';

export class RegistrarVotoDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  eleicaoId!: string;

  @IsString()
  @Matches(/^[1-9]\d*$/)
  cargoId!: string;

  @IsString()
  @Matches(/^[1-9]\d*$/)
  candidaturaId!: string;
}
