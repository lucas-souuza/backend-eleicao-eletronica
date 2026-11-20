// src/voto/dto/voto-resposta.dto.ts
// Formato de resposta do registro de voto (usado no Swagger).
// Por causa do sigilo do voto, a API não devolve em quem o eleitor votou.

import { ApiProperty } from '@nestjs/swagger';

export class VotoRespostaDto {
  @ApiProperty({
    description: 'Confirma que o voto foi registrado.',
    example: true,
  })
  registrado!: boolean;
}
