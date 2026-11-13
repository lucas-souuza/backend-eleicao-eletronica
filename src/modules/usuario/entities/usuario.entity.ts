import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Perfil } from '../../perfil/entities/perfil.entity';
import { Eleitor } from '../../eleitor/entities/eleitor.entity';
import { Candidato } from '../../candidato/entities/candidato.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  senha: string;

  @ManyToOne(() => Perfil, (perfil) => perfil.usuarios, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;

  @OneToOne(() => Eleitor, (eleitor) => eleitor.usuario)
  eleitor: Eleitor;

  @OneToOne(() => Candidato, (candidato) => candidato.usuario)
  candidato: Candidato;
}
