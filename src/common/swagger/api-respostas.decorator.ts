// src/common/swagger/api-respostas.decorator.ts
//
// Decorators reutilizáveis para documentar as respostas de erro no Swagger,
// evitando repetir o mesmo bloco em todos os controllers.

import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { ErroRespostaDto } from './erro-resposta.dto';
import { ESQUEMA_JWT } from './swagger.constantes';

const NOME_ERRO: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
};

function montarExemplos(status: HttpStatus, mensagens: (string | string[])[]) {
  return Object.fromEntries(
    mensagens.map((mensagem, indice) => [
      `exemplo${indice + 1}`,
      {
        summary: Array.isArray(mensagem) ? 'Erro de validação' : mensagem,
        value: {
          message: mensagem,
          ...(NOME_ERRO[status] ? { error: NOME_ERRO[status] } : {}),
          statusCode: status,
        },
      },
    ]),
  );
}

/**
 * Documenta uma resposta de erro com um ou mais exemplos de mensagem.
 *
 * @example
 * ApiRespostaErro(HttpStatus.NOT_FOUND, 'Eleição não existe.', 'Eleição não encontrada.')
 */
export function ApiRespostaErro(
  status: HttpStatus,
  descricao: string,
  ...mensagens: (string | string[])[]
) {
  return ApiResponse({
    status,
    description: descricao,
    type: ErroRespostaDto,
    ...(mensagens.length
      ? { examples: montarExemplos(status, mensagens) }
      : {}),
  });
}

/**
 * Erro 400 gerado pelo ValidationPipe quando o corpo da requisição
 * não respeita as regras do DTO.
 */
export function ApiErroValidacao(...mensagensExtras: (string | string[])[]) {
  return ApiRespostaErro(
    HttpStatus.BAD_REQUEST,
    'Dados inválidos (regras de validação do DTO).',
    ...mensagensExtras,
  );
}

/**
 * Marca a rota como protegida por JWT: adiciona o cadeado no Swagger UI
 * e documenta a resposta 401.
 */
export function ApiAutenticado() {
  return applyDecorators(
    ApiBearerAuth(ESQUEMA_JWT),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT ausente, inválido ou expirado.',
      type: ErroRespostaDto,
      example: { message: 'Unauthorized', statusCode: 401 },
    }),
  );
}

/**
 * Documenta a resposta 403 das rotas restritas por perfil (PerfisGuard).
 * Mensagens extras podem ser passadas quando o service também devolve 403.
 */
export function ApiPerfisPermitidos(
  perfis: string[],
  ...mensagensExtras: string[]
) {
  return ApiRespostaErro(
    HttpStatus.FORBIDDEN,
    `Acesso negado. Perfil(is) permitido(s): ${perfis.join(', ')}.`,
    'Forbidden resource',
    ...mensagensExtras,
  );
}
