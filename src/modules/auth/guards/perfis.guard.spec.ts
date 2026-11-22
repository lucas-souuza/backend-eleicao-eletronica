import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PerfisGuard } from './perfis.guard';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

describe('PerfisGuard', () => {
  let guard: PerfisGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const criarContexto = (user?: { perfil?: string }) =>
    ({
      getHandler: () => 'handler',
      getClass: () => 'classe',
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new PerfisGuard(reflector as unknown as Reflector);
  });

  it('consulta os metadados do handler e da classe', () => {
    reflector.getAllAndOverride.mockReturnValue(['ELEITOR']);

    guard.canActivate(criarContexto({ perfil: 'ELEITOR' }));

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERFIS_KEY, [
      'handler',
      'classe',
    ]);
  });

  it('libera o acesso quando a rota não exige perfil', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(criarContexto({ perfil: 'ELEITOR' }))).toBe(true);
  });

  it('libera o acesso quando a lista de perfis está vazia', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(criarContexto())).toBe(true);
  });

  it('libera quando o perfil do usuário é um dos permitidos', () => {
    reflector.getAllAndOverride.mockReturnValue(['CHEFE_SECAO', 'ELEITOR']);

    expect(guard.canActivate(criarContexto({ perfil: 'ELEITOR' }))).toBe(true);
  });

  it('bloqueia quando o perfil do usuário não é permitido', () => {
    reflector.getAllAndOverride.mockReturnValue(['CHEFE_SECAO']);

    expect(guard.canActivate(criarContexto({ perfil: 'ELEITOR' }))).toBe(false);
  });

  it('bloqueia quando a requisição não tem usuário autenticado', () => {
    reflector.getAllAndOverride.mockReturnValue(['CHEFE_SECAO']);

    expect(guard.canActivate(criarContexto(undefined))).toBe(false);
  });
});
