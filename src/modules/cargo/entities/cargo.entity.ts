import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn('identity', { type: 'smallint' })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  nome: string;
}
