// src/auth/dto/auth-resposta.dto.ts
// Formatos de resposta do módulo de autenticação (usados no Swagger).

import { ApiProperty } from '@nestjs/swagger';

import { PERFIS_USUARIO } from '../../../common/swagger/swagger.constantes';

export class LoginRespostaDto {
  @ApiProperty({
    description:
      'Token JWT. Envie no cabeçalho Authorization: Bearer <token>. Expira em 15 minutos.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicGVyZmlsIjoiQ0hFRkVfU0VDQU8ifQ.assinatura',
  })
  access_token!: string;

  @ApiProperty({ description: 'Tipo do token.', example: 'Bearer' })
  token_type!: string;
}

export class UsuarioAtualRespostaDto {
  @ApiProperty({
    description: 'ID do usuário autenticado (tabela usuarios).',
    example: '1',
  })
  usuarioId!: string;

  @ApiProperty({
    description: 'Perfil do usuário autenticado.',
    enum: PERFIS_USUARIO,
    example: 'CHEFE_SECAO',
  })
  perfil!: string;
}
