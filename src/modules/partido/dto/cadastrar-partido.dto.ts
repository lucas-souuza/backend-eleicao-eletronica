// src/partido/dto/cadastrar-partido.dto.ts

import { IsString, MaxLength, MinLength } from 'class-validator';

export class CadastrarPartidoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nome!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(15)
  sigla!: string;
}
