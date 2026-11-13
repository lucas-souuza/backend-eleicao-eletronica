import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn('identity', { type: 'int' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true,
  })
  sigla: string;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;
}
