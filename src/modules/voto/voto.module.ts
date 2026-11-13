import { Module } from '@nestjs/common';
import { VotoService } from './voto.service';

@Module({
  providers: [VotoService]
})
export class VotoModule {}
