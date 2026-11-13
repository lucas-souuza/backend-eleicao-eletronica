import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('perfis')
export class Perfil {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  nome: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  descricao: string | null;

  @OneToMany(() => Usuario, (usuario) => usuario.perfil)
  usuarios: Usuario[];
}
