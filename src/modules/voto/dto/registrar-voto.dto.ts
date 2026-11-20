// src/voto/dto/registrar-voto.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

import { PADRAO_ID } from '../../../common/swagger/swagger.constantes';

export class RegistrarVotoDto {
  @ApiProperty({
    description: 'ID da eleição. A eleição precisa estar ABERTA.',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(/^[1-9]\d*$/)
  eleicaoId!: string;

  @ApiProperty({
    description:
      'ID do cargo em que o voto será registrado (1 = Dep. Estadual, 2 = Dep. Federal, 3 = Senador, 4 = Governador, 5 = Presidente).',
    pattern: PADRAO_ID,
    example: '4',
  })
  @IsString()
  @Matches(/^[1-9]\d*$/)
  cargoId!: string;

  @ApiProperty({
    description:
      'ID da candidatura escolhida. Precisa pertencer à eleição e ao cargo informados.',
    pattern: PADRAO_ID,
    example: '1',
  })
  @IsString()
  @Matches(/^[1-9]\d*$/)
  candidaturaId!: string;
}
