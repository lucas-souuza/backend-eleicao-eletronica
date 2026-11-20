// src/autenticacao/dto/login.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail cadastrado do usuário.',
    format: 'email',
    example: 'chefe@eleicao.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo de 8 caracteres).',
    minLength: 8,
    format: 'password',
    example: 'Senha@123',
  })
  @IsString()
  @MinLength(8)
  senha!: string;
}
