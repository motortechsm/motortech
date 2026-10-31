// Formatos dos dados guardados no banco (Supabase).

export type Papel = "admin" | "vendedor";

export type Perfil = {
  id: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
};

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
};

export const CONDICOES = ["novo", "recondicionado", "usado"] as const;
export type Condicao = (typeof CONDICOES)[number];

export const NOMES_CONDICAO: Record<Condicao, string> = {
  novo: "Novo",
  recondicionado: "Recondicionado",
  usado: "Usado",
};

export type Produto = {
  id: string;
  nome: string;
  slug: string;
  codigo_peca: string | null;
  numero_serie: string | null;
  categoria_id: string | null;
  marca_veiculo: string | null;
  modelo_veiculo: string | null;
  ano_inicio: number | null;
  ano_fim: number | null;
  condicao: Condicao;
  descricao: string | null;
  preco: number;
  estoque: number;
  fotos: string[];
  ativo: boolean;
};
