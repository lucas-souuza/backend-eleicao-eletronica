import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('candidatos')
export class Candidato {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @OneToOne(() => Usuario, (usuario) => usuario.candidato, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;
}
