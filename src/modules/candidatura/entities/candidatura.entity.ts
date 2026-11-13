import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Candidato } from '../../candidato/entities/candidato.entity';
import { Eleicao } from '../../eleicao/entities/eleicao.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Partido } from '../../partido/entities/partido.entity';

@Entity('candidaturas')
@Index('UQ_candidatura_candidato_eleicao', ['candidato', 'eleicao'], {
  unique: true,
})
@Index(
  'UQ_candidatura_eleicao_cargo_numero',
  ['eleicao', 'cargo', 'numeroEleitoral'],
  { unique: true },
)
export class Candidatura {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @ManyToOne(() => Candidato, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'candidato_id' })
  candidato: Candidato;

  @ManyToOne(() => Eleicao, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'eleicao_id' })
  eleicao: Eleicao;

  @ManyToOne(() => Cargo, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;

  @ManyToOne(() => Partido, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'partido_id' })
  partido: Partido;

  @Column({
    name: 'numero_eleitoral',
    type: 'varchar',
    length: 10,
  })
  numeroEleitoral: string;
}
