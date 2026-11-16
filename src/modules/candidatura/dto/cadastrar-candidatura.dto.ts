// src/candidatura/dto/cadastrar-candidatura.dto.ts

import { IsString, Matches, MaxLength } from 'class-validator';

const ID_POSITIVO = /^[1-9]\d*$/;

export class CadastrarCandidaturaDto {
  @IsString()
  @Matches(ID_POSITIVO)
  candidatoId!: string;

  @IsString()
  @Matches(ID_POSITIVO)
  eleicaoId!: string;

  @IsString()
  @Matches(ID_POSITIVO)
  cargoId!: string;

  @IsString()
  @Matches(ID_POSITIVO)
  partidoId!: string;

  @IsString()
  @Matches(/^\d{1,10}$/, {
    message: 'numeroEleitoral deve ter de 1 a 10 dígitos.',
  })
  @MaxLength(10)
  numeroEleitoral!: string;
}
