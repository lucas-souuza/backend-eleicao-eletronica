import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('eleitores')
export class Eleitor {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @OneToOne(() => Usuario, (usuario) => usuario.eleitor, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  tituloEleitor: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;
}
