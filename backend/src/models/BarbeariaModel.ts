export interface BarbeariaModel {
  id: number;
  usuario_id: number;
  nome_comercial: string;
  telefone_comercial?: string | null;
  endereco: string;
  cidade_id: number;
  descricao?: string;
  foto_perfil?: string;
  intervalo_base: number;
}
