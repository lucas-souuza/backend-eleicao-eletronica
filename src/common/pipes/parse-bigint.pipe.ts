// src/common/pipes/parse-bigint.pipe.ts

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, string> {
  transform(valor: string): string {
    if (!/^[1-9]\d*$/.test(valor)) {
      throw new BadRequestException('Identificador inválido.');
    }

    return valor;
  }
}
