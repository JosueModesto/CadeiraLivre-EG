export type TipoUsuarioModel = "cliente" | "barbearia" | "administrador";

export interface UsuarioModel {
  id: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco?: string | null;
  tipo_usuario: TipoUsuarioModel;
  cidade_id?: number | null;
  criado_em: Date;
}
