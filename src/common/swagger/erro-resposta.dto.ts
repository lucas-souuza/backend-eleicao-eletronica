// src/common/swagger/erro-resposta.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Formato padrão dos erros devolvidos pelo NestJS (HttpException).
 * Usado apenas para documentação no Swagger.
 */
export class ErroRespostaDto {
  @ApiProperty({ description: 'Código HTTP do erro.', example: 400 })
  statusCode!: number;

  @ApiProperty({
    description:
      'Mensagem do erro. Em erros de validação do corpo da requisição vem como lista de mensagens.',
    oneOf: [
      { type: 'string', example: 'Eleição não encontrada.' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email'],
      },
    ],
  })
  message!: string | string[];

  @ApiPropertyOptional({
    description: 'Nome do erro HTTP.',
    example: 'Bad Request',
  })
  error?: string;
}
