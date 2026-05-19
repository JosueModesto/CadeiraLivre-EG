export type TipoUsuarioModel = "cliente" | "barbearia";

export interface UsuarioModel {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  tipo_usuario: TipoUsuarioModel;
  cidade_id?: number | null;
  criado_em: Date;
}
