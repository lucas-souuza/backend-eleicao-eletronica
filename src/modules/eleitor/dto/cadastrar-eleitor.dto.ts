// src/eleitor/dto/cadastrar-eleitor.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastrarEleitorDto {
  @IsString()
  @MaxLength(150)
  nome!: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  senha!: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números.' })
  cpf!: string;

  @IsString()
  @Matches(/^\d{12}$/, {
    message: 'Título eleitoral deve conter 12 números.',
  })
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;
}
