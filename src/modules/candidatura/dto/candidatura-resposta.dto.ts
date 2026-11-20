// src/candidatura/dto/candidatura-resposta.dto.ts
// Formato de resposta do módulo de candidaturas (usado no Swagger).

import { ApiProperty } from '@nestjs/swagger';

export class CandidaturaRespostaDto {
  @ApiProperty({
    description: 'ID da candidatura. É o valor usado em POST /votos.',
    example: '1',
  })
  id!: string;

  @ApiProperty({ description: 'ID do candidato.', example: '1' })
  candidatoId!: string;

  @ApiProperty({ description: 'ID da eleição.', example: '1' })
  eleicaoId!: string;

  @ApiProperty({ description: 'ID do cargo.', example: 4 })
  cargoId!: number;

  @ApiProperty({ description: 'ID do partido.', example: 1 })
  partidoId!: number;

  @ApiProperty({ description: 'Número do candidato na urna.', example: '45' })
  numeroEleitoral!: string;
}
