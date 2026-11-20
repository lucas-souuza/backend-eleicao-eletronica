import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { TAGS } from './common/swagger/swagger.constantes';

@ApiTags(TAGS.status)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar se a API está no ar',
    description: 'Rota pública, sem autenticação.',
  })
  @ApiOkResponse({
    description: 'API funcionando.',
    content: {
      'text/html': { schema: { type: 'string', example: 'Hello World!' } },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
