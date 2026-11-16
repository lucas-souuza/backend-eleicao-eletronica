import { Module } from '@nestjs/common';
import { InscricaoEleitorService } from './inscricao-eleitor.service';
import { InscricaoEleitorController } from './inscricao-eleitor.controller';
import { InscricaoEleitor } from './entities/inscricao-eleitor.entity';
import { Eleitor } from '../eleitor/entities/eleitor.entity';
import { Eleicao } from '../eleicao/entities/eleicao.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InscricaoEleitor, Eleitor, Eleicao]),
    AuthModule,
  ],
  providers: [InscricaoEleitorService],
  controllers: [InscricaoEleitorController],
})
export class InscricaoEleitorModule {}
