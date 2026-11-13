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

@Entity('inscricoes_eleitor')
@Index('UQ_inscricao_eleitor', ['eleitor'], { unique: true })
export class InscricaoEleitor {
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

  @CreateDateColumn({
    name: 'inscrito_em',
    type: 'timestamp',
  })
  inscritoEm: Date;
}
