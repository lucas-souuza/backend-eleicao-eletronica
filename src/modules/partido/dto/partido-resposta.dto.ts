// src/partido/dto/partido-resposta.dto.ts
// Formato de resposta do módulo de partidos (usado no Swagger).

import { ApiProperty } from '@nestjs/swagger';

export class PartidoRespostaDto {
  @ApiProperty({ description: 'ID do partido.', example: 1 })
  id!: number;

  @ApiProperty({
    description: 'Nome do partido.',
    example: 'Partido da Universidade',
  })
  nome!: string;

  @ApiProperty({ description: 'Sigla do partido.', example: 'PUNI' })
  sigla!: string;
}
