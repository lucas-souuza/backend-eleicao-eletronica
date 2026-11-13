import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Candidatura } from '../../candidatura/entities/candidatura.entity';

@Entity('votos')
export class Voto {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @ManyToOne(() => Candidatura, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'candidatura_id' })
  candidatura: Candidatura;

  @CreateDateColumn({
    name: 'registrado_em',
    type: 'timestamp',
  })
  registradoEm: Date;
}
