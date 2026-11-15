import { MigrationInterface, QueryRunner } from 'typeorm';

export class InserirDadosIniciais1794782961027 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const perfis: [string, string][] = [
      ['CHEFE_SECAO', 'Responsável pela administração do sistema eleitoral.'],
      ['ELEITOR', 'Usuário autorizado a participar da votação.'],
      ['CANDIDATO', 'Usuário candidato a um cargo na eleição.'],
    ];

    for (const [nome, descricao] of perfis) {
      await queryRunner.query(
        `INSERT INTO "perfis" ("nome", "descricao")
       VALUES ($1, $2)
       ON CONFLICT ("nome") DO NOTHING`,
        [nome, descricao],
      );
    }

    const situacoes: [string, string][] = [
      ['AGENDADA', 'Eleição ainda não aberta para votação.'],
      ['ABERTA', 'Eleição aberta para votação.'],
      ['ENCERRADA', 'Eleição encerrada.'],
    ];

    for (const [nome, descricao] of situacoes) {
      await queryRunner.query(
        `INSERT INTO "situacoes_eleicao" ("nome", "descricao")
       VALUES ($1, $2)
       ON CONFLICT ("nome") DO NOTHING`,
        [nome, descricao],
      );
    }

    const cargos = [
      'Deputado Estadual',
      'Deputado Federal',
      'Senador',
      'Governador',
      'Presidente da República',
    ];

    for (const nome of cargos) {
      await queryRunner.query(
        `INSERT INTO "cargos" ("nome")
       VALUES ($1)
       ON CONFLICT ("nome") DO NOTHING`,
        [nome],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "cargos"
     WHERE "nome" IN ($1, $2, $3, $4, $5)`,
      [
        'Deputado Estadual',
        'Deputado Federal',
        'Senador',
        'Governador',
        'Presidente da República',
      ],
    );

    await queryRunner.query(
      `DELETE FROM "situacoes_eleicao"
     WHERE "nome" IN ($1, $2, $3)`,
      ['AGENDADA', 'ABERTA', 'ENCERRADA'],
    );

    await queryRunner.query(
      `DELETE FROM "perfis"
     WHERE "nome" IN ($1, $2, $3)`,
      ['CHEFE_SECAO', 'ELEITOR', 'CANDIDATO'],
    );
  }
}
