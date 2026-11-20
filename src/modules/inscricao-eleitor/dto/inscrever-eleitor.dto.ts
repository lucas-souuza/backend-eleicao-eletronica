// src/inscricao-eleitor/dto/inscrever-eleitor.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

import { PADRAO_ID } from '../../../common/swagger/swagger.constantes';

const ID_POSITIVO = /^[1-9]\d*$/;

export class InscreverEleitorDto {
  @ApiProperty({
    description: 'ID do eleitor (tabela eleitores).',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  eleitorId!: string;

  @ApiProperty({
    description: 'ID da eleição. A eleição precisa estar AGENDADA.',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  eleicaoId!: string;
}
