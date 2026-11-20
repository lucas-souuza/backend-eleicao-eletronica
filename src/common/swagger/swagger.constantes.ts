// src/common/swagger/swagger.constantes.ts

/** Nome do esquema de segurança (Bearer JWT) registrado no Swagger. */
export const ESQUEMA_JWT = 'jwt';

/** Perfis de usuário cadastrados na migration de dados iniciais. */
export const PERFIS_USUARIO = ['CHEFE_SECAO', 'ELEITOR', 'CANDIDATO'] as const;

/** Situações possíveis de uma eleição. */
export const SITUACOES_ELEICAO = ['AGENDADA', 'ABERTA', 'ENCERRADA'] as const;

/** Tags (agrupamentos) exibidas no Swagger UI, na ordem do fluxo da eleição. */
export const TAGS = {
  status: 'Status',
  autenticacao: 'Autenticação',
  partidos: 'Partidos',
  eleicoes: 'Eleições',
  candidatos: 'Candidatos',
  candidaturas: 'Candidaturas',
  eleitores: 'Eleitores',
  inscricoes: 'Inscrições de eleitores',
  votacao: 'Votação',
  resultados: 'Resultados',
} as const;

/** Regex usada nos DTOs para identificadores numéricos positivos. */
export const PADRAO_ID = '^[1-9]\\d*$';
