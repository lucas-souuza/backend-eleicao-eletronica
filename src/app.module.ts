import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilModule } from './modules/perfil/perfil.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { EleitorModule } from './modules/eleitor/eleitor.module';
import { CandidatoModule } from './modules/candidato/candidato.module';
import { EleicaoModule } from './modules/eleicao/eleicao.module';
import { CargoModule } from './modules/cargo/cargo.module';
import { PartidoModule } from './modules/partido/partido.module';
import { SituacaoEleicaoModule } from './modules/situacao-eleicao/situacao-eleicao.module';
import { CandidaturaModule } from './modules/candidatura/candidatura.module';
import { InscricaoEleitorModule } from './modules/inscricao-eleitor/inscricao-eleitor.module';
import { ControleVotacaoService } from './modules/controle-votacao/controle-votacao.service';
import { ControleVotacaoModule } from './modules/controle-votacao/controle-votacao.module';
import { VotoModule } from './modules/voto/voto.module';
import { AuthModule } from './modules/auth/auth.module';
import 'dotenv/config';
import { ConfigModule } from '@nestjs/config';
import { ResultadoModule } from './modules/resultado/resultado.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: true,

      autoLoadEntities: true,
      synchronize: false,

      retryAttempts: 5,
      retryDelay: 3000,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PerfilModule,
    UsuarioModule,
    EleitorModule,
    CandidatoModule,
    EleicaoModule,
    CargoModule,
    PartidoModule,
    SituacaoEleicaoModule,
    CandidaturaModule,
    InscricaoEleitorModule,
    ControleVotacaoModule,
    VotoModule,
    AuthModule,
    ResultadoModule,
  ],
  controllers: [AppController],
  providers: [AppService, ControleVotacaoService],
})
export class AppModule {}
