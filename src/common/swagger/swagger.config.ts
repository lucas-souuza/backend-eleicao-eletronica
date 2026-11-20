// src/common/swagger/swagger.config.ts

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ESQUEMA_JWT, TAGS } from './swagger.constantes';

/** Caminho do Swagger UI (sem o prefixo global /v1/api). */
export const CAMINHO_DOCS = 'docs';

const DESCRICAO = `
API REST do **Sistema de Simulação de Eleição Eletrônica**.

### Como autenticar
1. Faça login em \`POST /v1/api/auth/login\` (por exemplo, com o Chefe da Seção criado pelo \`npm run seed:chefe\`).
2. Copie o \`access_token\` da resposta.
3. Clique em **Authorize** (cadeado no topo da página) e cole o token.

O token expira em **15 minutos**. Depois disso, faça login de novo.

### Perfis
| Perfil | O que pode fazer |
| --- | --- |
| \`CHEFE_SECAO\` | Cadastra partidos, eleições, candidatos, candidaturas e eleitores; inscreve eleitores; abre e encerra a votação. |
| \`ELEITOR\` | Vota (uma vez por cargo) e acompanha os resultados de todos os cargos. |
| \`CANDIDATO\` | Acompanha os resultados apenas do cargo em que concorre. |

### Fluxo sugerido para a demonstração
1. **Chefe da Seção**: cadastrar partido → criar eleição → cadastrar candidato → cadastrar candidatura → cadastrar eleitor → inscrever eleitor → abrir eleição.
2. **Eleitor**: login → registrar voto → consultar resultados.
3. **Candidato**: login → consultar resultados (só do seu cargo).
4. **Chefe da Seção**: encerrar eleição → resultado final.

### Sigilo do voto
O voto é gravado apenas com a candidatura escolhida. O controle de "quem já votou" fica em uma tabela separada, sem ligação com o voto, então não é possível consultar em quem um eleitor votou.
`;

export function configurarSwagger(app: INestApplication): void {
  const configuracao = new DocumentBuilder()
    .setTitle('API - Simulação de Eleição Eletrônica')
    .setDescription(DESCRICAO)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Cole aqui o access_token devolvido por POST /v1/api/auth/login.',
      },
      ESQUEMA_JWT,
    )
    .addTag(TAGS.status, 'Verificação de que a API está no ar.')
    .addTag(TAGS.autenticacao, 'Login e dados do usuário autenticado.')
    .addTag(TAGS.partidos, 'Cadastro e consulta de partidos.')
    .addTag(
      TAGS.eleicoes,
      'Cadastro da eleição e controle da votação (AGENDADA → ABERTA → ENCERRADA).',
    )
    .addTag(TAGS.candidatos, 'Cadastro de candidatos (pessoa + usuário).')
    .addTag(
      TAGS.candidaturas,
      'Associação do candidato a uma eleição, um cargo e um partido.',
    )
    .addTag(TAGS.eleitores, 'Cadastro de eleitores (pessoa + usuário).')
    .addTag(TAGS.inscricoes, 'Inscrição de um eleitor em uma eleição.')
    .addTag(TAGS.votacao, 'Registro de votos pelo eleitor.')
    .addTag(
      TAGS.resultados,
      'Acompanhamento da votação e resultado final por cargo.',
    )
    .build();

  const documento = SwaggerModule.createDocument(app, configuracao);

  // Swagger UI:   http://localhost:3000/docs
  // JSON (OpenAPI): http://localhost:3000/docs-json
  SwaggerModule.setup(CAMINHO_DOCS, app, documento, {
    customSiteTitle: 'Eleição Eletrônica - API',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      displayRequestDuration: true,
    },
  });
}
