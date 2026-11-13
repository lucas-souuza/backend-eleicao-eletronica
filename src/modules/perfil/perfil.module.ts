import { Module } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil])],
  providers: [PerfilService],
})
export class PerfilModule {}
