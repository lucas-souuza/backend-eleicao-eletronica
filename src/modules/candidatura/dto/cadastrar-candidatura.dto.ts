// src/candidatura/dto/cadastrar-candidatura.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

import { PADRAO_ID } from '../../../common/swagger/swagger.constantes';

const ID_POSITIVO = /^[1-9]\d*$/;

export class CadastrarCandidaturaDto {
  @ApiProperty({
    description: 'ID do candidato (devolvido por POST /candidatos).',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  candidatoId!: string;

  @ApiProperty({
    description: 'ID da eleição. A eleição precisa estar AGENDADA.',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  eleicaoId!: string;

  @ApiProperty({
    description:
      'ID do cargo. Na carga inicial: 1 = Deputado Estadual, 2 = Deputado Federal, 3 = Senador, 4 = Governador, 5 = Presidente da República.',
    pattern: PADRAO_ID,
    example: '4',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  cargoId!: string;

  @ApiProperty({
    description: 'ID do partido (veja GET /partidos).',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(ID_POSITIVO)
  partidoId!: string;

  @ApiProperty({
    description:
      'Número do candidato na urna (1 a 10 dígitos). Não pode se repetir no mesmo cargo e eleição.',
    pattern: '^\\d{1,10}$',
    maxLength: 10,
    example: '45',
  })
  @IsString()
  @Matches(/^\d{1,10}$/, {
    message: 'numeroEleitoral deve ter de 1 a 10 dígitos.',
  })
  @MaxLength(10)
  numeroEleitoral!: string;
}
