import { Module } from '@nestjs/common';
import { EleitorService } from './eleitor.service';
import { Eleitor } from './entities/eleitor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EleitorController } from './eleitor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Eleitor])],
  providers: [EleitorService],
  controllers: [EleitorController],
})
export class EleitorModule {}
