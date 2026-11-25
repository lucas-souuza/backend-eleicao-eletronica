# Sistema de Eleição Eletrônica

Sistema web para gerenciamento de eleições, inscrições de eleitores, candidaturas, votação e apuração de resultados.

## Entregáveis

- **Repositório Git:** [GitHub](https://github.com/lucas-souuza/backend-eleicao-eletronica/tree/develop)
- **Documentação da API (Swagger):** disponível em `http://localhost:3000/docs`
- **Integrantes:** Cristiano Reis, Gabriel Viola, Guilherme Roupe, Lucas Martins

> O endereço local do Swagger, como `http://localhost:3000/docs`, funciona apenas para quem está executando a API na própria máquina.

## Arquitetura

A aplicação utiliza uma arquitetura de **monólito modular** com NestJS. O sistema é executado como uma aplicação, mas seu código é dividido em módulos por responsabilidade do domínio. Cada módulo pode concentrar entidades, regras de negócio, serviços e endpoints relacionados à sua funcionalidade.

A API utiliza PostgreSQL como banco de dados e TypeORM para mapeamento das entidades e execução das migrations. As alterações de estrutura do banco são controladas por migrations; a sincronização automática de entidades está desativada (`synchronize: false`).

A autenticação utiliza JWT. O perfil do usuário determina o acesso às operações protegidas. A aplicação conecta-se ao PostgreSQL hospedado no Neon.

## Modularização

Os módulos representam as principais áreas funcionais do sistema:

- **Auth:** autenticação, emissão de token e identificação do usuário autenticado.
- **Usuario e Perfil:** contas de acesso e seus perfis.
- **Eleitor:** cadastro e dados dos eleitores.
- **Candidato:** cadastro e dados dos candidatos.
- **Eleicao e SituacaoEleicao:** eleições e seus estados, incluindo abertura e encerramento.
- **Cargo e Partido:** cargos em disputa e partidos.
- **InscricaoEleitor:** vínculo de eleitores com eleições.
- **Candidatura:** associação de candidato, eleição, cargo e partido, incluindo o número eleitoral.
- **Voto:** registro da escolha computada para uma candidatura.
- **ControleVotacao:** registro usado para controlar a participação do eleitor por eleição e cargo.
- **Apuração/Resultados:** consulta da quantidade de votos computados para as candidaturas.

## Modelagem do banco de dados

As tabelas usam nomes no plural, enquanto as classes e entidades TypeScript usam nomes no singular. As chaves primárias são do tipo `BIGINT` no PostgreSQL e são representadas como `string` no TypeScript para evitar perda de precisão.

Principais relações:

- Um perfil pode estar associado a vários usuários.
- Um usuário pode estar associado a um cadastro de eleitor ou de candidato.
- Uma eleição possui uma situação.
- Uma inscrição associa um eleitor a uma eleição.
- Uma candidatura associa candidato, eleição, cargo e partido.
- Um voto referencia a candidatura que recebeu o voto.
- O controle de votação associa eleitor, eleição e cargo para impedir que o mesmo eleitor vote mais de uma vez no mesmo cargo daquela eleição.

Para preservar a separação entre participação e escolha, a tabela `votos` não possui relacionamento direto com `eleitores`. A tabela `controles_votacao` registra a participação, enquanto `votos` permite a apuração por candidatura.

Restrições de unicidade no banco protegem regras como e-mail, CPF, título eleitoral, número eleitoral por eleição e cargo, inscrição e voto duplicados, conforme definido no esquema e nas migrations.

## Tecnologias

- Node.js 26.13.0
- npm 12.2.0
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- Docker e Docker Compose

## Executar localmente com Docker

1. Clone o repositório:

   ```bash
   git clone https://github.com/lucas-souuza/backend-eleicao-eletronica.git
   cd backend-eleicao-eletronica
   ```

2. Crie o arquivo de ambiente local:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Preencha o `.env` com as configurações necessárias, como a URL do banco e o segredo JWT. **Não compartilhe nem versione esse arquivo.**

4. Inicie a aplicação:

   ```bash
   docker compose up --build
   ```

5. A API ficará disponível em `http://localhost:3000/v1/api`. A documentação Swagger ficará no caminho configurado em `src/main.ts`.

Para encerrar a aplicação:

```bash
docker compose down
```

## Migrations

As migrations registram as mudanças no esquema do banco. Ao alterar a modelagem, crie uma nova migration e revise o arquivo gerado antes de aplicá-la ao banco.

## Testes

Os fluxos da API foram verificados manualmente durante o desenvolvimento. [Adicionar aqui os testes automatizados quando forem implementados.]
