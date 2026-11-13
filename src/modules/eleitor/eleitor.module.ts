import { Module } from '@nestjs/common';
import { EleitorService } from './eleitor.service';
import { Eleitor } from './entities/eleitor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Eleitor])],
  providers: [EleitorService],
})
export class EleitorModule {}
