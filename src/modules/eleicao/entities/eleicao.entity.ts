import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { SituacaoEleicao } from '../../situacao-eleicao/entities/situacao-eleicao.entity';

@Entity('eleicoes')
export class Eleicao {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'data_eleicao', type: 'date' })
  dataEleicao: string;

  @Column({ type: 'smallint' })
  turno: number;

  @Column({ name: 'horario_abertura', type: 'time' })
  horarioAbertura: string;

  @Column({ name: 'horario_encerramento', type: 'time' })
  horarioEncerramento: string;

  @ManyToOne(() => SituacaoEleicao, (situacao) => situacao.eleicoes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'situacao_id' })
  situacao: SituacaoEleicao;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;
}
