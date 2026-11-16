// src/candidato/dto/cadastrar-candidato.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastrarCandidatoDto {
  @IsString()
  @MaxLength(150)
  nome!: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números.' })
  cpf!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  senha!: string;
}
