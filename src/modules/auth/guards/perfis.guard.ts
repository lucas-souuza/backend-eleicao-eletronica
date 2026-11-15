// src/auth/guards/perfis.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<string[]>(
      PERFIS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!perfisPermitidos?.length) {
      return true;
    }

    const requisicao = context.switchToHttp().getRequest();
    return perfisPermitidos.includes(requisicao.user?.perfil);
  }
}
