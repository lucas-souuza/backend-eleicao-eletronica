import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Eleicao } from '../../eleicao/entities/eleicao.entity';

@Entity('situacoes_eleicao')
export class SituacaoEleicao {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
  })
  nome: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  descricao: string | null;

  @OneToMany(() => Eleicao, (eleicao) => eleicao.situacao)
  eleicoes: Eleicao[];
}
