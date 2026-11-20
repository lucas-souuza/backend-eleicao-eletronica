// src/partido/dto/cadastrar-partido.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CadastrarPartidoDto {
  @ApiProperty({
    description: 'Nome do partido.',
    minLength: 1,
    maxLength: 100,
    example: 'Partido da Universidade',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nome!: string;

  @ApiProperty({
    description: 'Sigla do partido. É única e salva em letras maiúsculas.',
    minLength: 1,
    maxLength: 15,
    example: 'PUNI',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(15)
  sigla!: string;
}
