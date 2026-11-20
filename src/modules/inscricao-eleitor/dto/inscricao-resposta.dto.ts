// src/inscricao-eleitor/dto/inscricao-resposta.dto.ts
// Formato de resposta do módulo de inscrição de eleitores (usado no Swagger).

import { ApiProperty } from '@nestjs/swagger';

export class InscricaoRespostaDto {
  @ApiProperty({ description: 'ID da inscrição.', example: '1' })
  id!: string;

  @ApiProperty({ description: 'ID do eleitor inscrito.', example: '1' })
  eleitorId!: string;

  @ApiProperty({ description: 'ID da eleição.', example: '1' })
  eleicaoId!: string;

  @ApiProperty({
    description: 'Data e hora da inscrição.',
    format: 'date-time',
    example: '2026-11-20T19:30:00.000Z',
  })
  inscritoEm!: Date;
}
