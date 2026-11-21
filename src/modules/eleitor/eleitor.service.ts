// src/eleitor/eleitor.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Eleitor } from './entities/eleitor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Perfil } from '../perfil/entities/perfil.entity';
import { CadastrarEleitorDto } from './dto/cadastrar-eleitor.dto';

@Injectable()
export class EleitorService {
  constructor(private readonly dataSource: DataSource) {}

  async cadastrar(dto: CadastrarEleitorDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const eleitorRepository = manager.getRepository(Eleitor);
        const usuarioRepository = manager.getRepository(Usuario);
        const perfilRepository = manager.getRepository(Perfil);

        const perfilEleitor = await perfilRepository.findOneBy({
          nome: 'ELEITOR',
        });

        if (!perfilEleitor) {
          throw new InternalServerErrorException(
            'Perfil ELEITOR não encontrado. Confira a migration de dados iniciais.',
          );
        }

        const usuario = usuarioRepository.create({
          email: dto.email.trim().toLowerCase(),
          senha: await bcrypt.hash(dto.senha, 12),
          perfil: perfilEleitor,
        });

        const usuarioSalvo = await usuarioRepository.save(usuario);

        const eleitor = eleitorRepository.create({
          usuario: usuarioSalvo,
          nome: dto.nome.trim(),
          cpf: dto.cpf,
          tituloEleitor: dto.titulo,
          telefone: dto.telefone?.trim() || null,
        });

        const eleitorSalvo = await eleitorRepository.save(eleitor);

        // Nunca devolva a senha ou o hash pela API.
        return {
          id: eleitorSalvo.id,
          nome: eleitorSalvo.nome,
          email: usuarioSalvo.email,
          criadoEm: eleitorSalvo.criadoEm,
        };
      });
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Já existe um usuário com esse e-mail, CPF ou título eleitoral.',
        );
      }

      throw erro;
    }
  }
}
