import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Candidato } from './entities/candidato.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Perfil } from '../perfil/entities/perfil.entity';
import { CadastrarCandidatoDto } from './dto/cadastrar-candidato.dto';

@Injectable()
export class CandidatoService {
  constructor(private readonly dataSource: DataSource) {}

  async cadastrar(dto: CadastrarCandidatoDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const candidatoRepository = manager.getRepository(Candidato);
        const usuarioRepository = manager.getRepository(Usuario);
        const perfilRepository = manager.getRepository(Perfil);

        const perfilCandidato = await perfilRepository.findOneBy({
          nome: 'CANDIDATO',
        });

        if (!perfilCandidato) {
          throw new InternalServerErrorException(
            'Perfil CANDIDATO não encontrado. Confira a migration de dados iniciais.',
          );
        }

        const usuario = usuarioRepository.create({
          email: dto.email.trim().toLowerCase(),
          senha: await bcrypt.hash(dto.senha, 12),
          perfil: perfilCandidato,
        });

        const usuarioSalvo = await usuarioRepository.save(usuario);

        const candidato = candidatoRepository.create({
          usuario: usuarioSalvo,
          nome: dto.nome.trim(),
          cpf: dto.cpf,
          telefone: dto.telefone?.trim() || null,
        });

        const candidatoSalvo = await candidatoRepository.save(candidato);

        // Não devolver senha, hash, CPF nem telefone.
        return {
          id: candidatoSalvo.id,
          nome: candidatoSalvo.nome,
          email: usuarioSalvo.email,
          criadoEm: candidatoSalvo.criadoEm,
        };
      });
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Já existe um usuário com esse e-mail ou um candidato com esse CPF.',
        );
      }

      throw erro;
    }
  }
}
