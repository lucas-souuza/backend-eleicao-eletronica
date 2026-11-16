// src/inscricao-eleitor/dto/inscrever-eleitor.dto.ts

import { IsString, Matches } from 'class-validator';

const ID_POSITIVO = /^[1-9]\d*$/;

export class InscreverEleitorDto {
  @IsString()
  @Matches(ID_POSITIVO)
  eleitorId!: string;

  @IsString()
  @Matches(ID_POSITIVO)
  eleicaoId!: string;
}
