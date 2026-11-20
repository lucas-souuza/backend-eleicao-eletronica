// src/resultado/dto/resultado-resposta.dto.ts
// Formato de resposta do módulo de resultados (usado no Swagger).

import { ApiProperty } from '@nestjs/swagger';

import { SITUACOES_ELEICAO } from '../../../common/swagger/swagger.constantes';

export class ResultadoCandidaturaDto {
  @ApiProperty({ description: 'ID do cargo.', example: 4 })
  cargoId!: number;

  @ApiProperty({ description: 'Nome do cargo.', example: 'Governador' })
  cargoNome!: string;

  @ApiProperty({ description: 'ID do candidato.', example: '1' })
  candidatoId!: string;

  @ApiProperty({ description: 'Nome do candidato.', example: 'Maria Oliveira' })
  candidatoNome!: string;

  @ApiProperty({ description: 'Sigla do partido.', example: 'PUNI' })
  partidoSigla!: string;

  @ApiProperty({ description: 'ID da candidatura.', example: '1' })
  candidaturaId!: string;

  @ApiProperty({ description: 'Número do candidato na urna.', example: '45' })
  numeroEleitoral!: string;

  @ApiProperty({
    description: 'Quantidade de votos recebidos até o momento (em texto).',
    example: '12',
  })
  totalVotos!: string;
}

export class ResultadoRespostaDto {
  @ApiProperty({ description: 'ID da eleição.', example: '1' })
  eleicaoId!: string;

  @ApiProperty({
    description:
      'Situação da eleição. ABERTA = resultado parcial; ENCERRADA = resultado final.',
    enum: SITUACOES_ELEICAO,
    example: 'ABERTA',
  })
  situacao!: string;

  @ApiProperty({
    description:
      'Votos por candidatura, ordenados por cargo e nome do candidato. Para o perfil CANDIDATO, vem apenas o cargo em que ele concorre.',
    type: [ResultadoCandidaturaDto],
  })
  resultados!: ResultadoCandidaturaDto[];
}
