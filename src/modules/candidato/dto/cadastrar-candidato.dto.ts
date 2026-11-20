// src/candidato/dto/cadastrar-candidato.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastrarCandidatoDto {
  @ApiProperty({
    description: 'Nome completo do candidato.',
    maxLength: 150,
    example: 'Maria Oliveira',
  })
  @IsString()
  @MaxLength(150)
  nome!: string;

  @ApiProperty({
    description: 'CPF com 11 números, sem pontos ou traço. É único.',
    pattern: '^\\d{11}$',
    example: '12345678901',
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números.' })
  cpf!: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato.',
    maxLength: 20,
    example: '21999998888',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({
    description:
      'E-mail usado no login do candidato. É único e salvo em minúsculas.',
    format: 'email',
    maxLength: 150,
    example: 'maria.oliveira@eleicao.com',
  })
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({
    description: 'Senha de acesso do candidato (mínimo de 8 caracteres).',
    format: 'password',
    minLength: 8,
    example: 'Senha@123',
  })
  @IsString()
  @MinLength(8)
  senha!: string;
}
