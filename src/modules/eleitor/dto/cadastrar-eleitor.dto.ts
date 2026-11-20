// src/eleitor/dto/cadastrar-eleitor.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastrarEleitorDto {
  @ApiProperty({
    description: 'Nome completo do eleitor.',
    maxLength: 150,
    example: 'João Souza',
  })
  @IsString()
  @MaxLength(150)
  nome!: string;

  @ApiProperty({
    description:
      'E-mail usado no login do eleitor. É único e salvo em minúsculas.',
    format: 'email',
    maxLength: 150,
    example: 'joao.souza@eleicao.com',
  })
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({
    description: 'Senha de acesso do eleitor (mínimo de 8 caracteres).',
    format: 'password',
    minLength: 8,
    example: 'Senha@123',
  })
  @IsString()
  @MinLength(8)
  senha!: string;

  @ApiProperty({
    description: 'CPF com 11 números, sem pontos ou traço. É único.',
    pattern: '^\\d{11}$',
    example: '98765432100',
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números.' })
  cpf!: string;

  @ApiProperty({
    description: 'Título de eleitor com 12 números. É único.',
    pattern: '^\\d{12}$',
    example: '123456789012',
  })
  @IsString()
  @Matches(/^\d{12}$/, {
    message: 'Título eleitoral deve conter 12 números.',
  })
  titulo!: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato.',
    maxLength: 20,
    example: '21988887777',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;
}
