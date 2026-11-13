import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,

  ssl: true,

  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
  migrationsRun: false,
});

export default dataSource;
