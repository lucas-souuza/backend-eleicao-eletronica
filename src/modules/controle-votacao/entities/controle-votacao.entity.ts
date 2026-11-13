import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Eleitor } from '../../eleitor/entities/eleitor.entity';
import { Eleicao } from '../../eleicao/entities/eleicao.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';

@Entity('controles_votacao')
@Index('UQ_controle_eleitor_eleicao_cargo', ['eleitor', 'eleicao', 'cargo'], {
  unique: true,
})
export class ControleVotacao {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @ManyToOne(() => Eleitor, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'eleitor_id' })
  eleitor: Eleitor;

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

  @CreateDateColumn({
    name: 'registrado_em',
    type: 'timestamp',
  })
  registradoEm: Date;
}
