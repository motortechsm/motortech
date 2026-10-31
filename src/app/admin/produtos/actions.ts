"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirEquipe } from "@/lib/auth";
import { criarSlug, ehUuid, lerPreco } from "@/lib/formato";
import { CONDICOES, type Condicao } from "@/lib/tipos";

export type EstadoFormulario = { erro: string | null };

function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

function textoOuNulo(dados: FormData, campo: string, limite = 200): string | null {
  const valor = texto(dados, campo).slice(0, limite);
  return valor || null;
}

// "" -> null; "2015" -> 2015; qualquer outra coisa -> "invalido"
function lerAno(valor: string): number | null | "invalido" {
  if (!valor) return null;
  if (!/^\d{4}$/.test(valor)) return "invalido";
  const ano = Number(valor);
  return ano >= 1950 && ano <= 2100 ? ano : "invalido";
}

export async function salvarProduto(
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const { supabase, perfil } = await exigirEquipe();
  if (perfil.papel !== "admin") {
    return { erro: "Só a administradora pode cadastrar ou alterar produtos." };
  }

  const id = texto(dados, "id");
  if (id && !ehUuid(id)) return { erro: "Produto não encontrado." };

  const nome = texto(dados, "nome").slice(0, 150);
  if (!nome) return { erro: "Digite o nome do módulo." };

  const preco = lerPreco(texto(dados, "preco") || "0");
  if (preco === null) return { erro: "Preço inválido. Exemplo: 1500,00" };

  const estoqueTexto = texto(dados, "estoque") || "0";
  if (!/^\d{1,6}$/.test(estoqueTexto)) {
    return { erro: "Estoque deve ser um número inteiro, como 0, 1 ou 5." };
  }

  const anoInicio = lerAno(texto(dados, "ano_inicio"));
  const anoFim = lerAno(texto(dados, "ano_fim"));
  if (anoInicio === "invalido" || anoFim === "invalido") {
    return { erro: "Ano inválido. Use 4 números, como 2015." };
  }
  if (anoInicio !== null && anoFim !== null && anoFim < anoInicio) {
    return { erro: "O ano final não pode ser menor que o ano inicial." };
  }

  const condicaoTexto = texto(dados, "condicao");
  const condicao: Condicao = (CONDICOES as readonly string[]).includes(condicaoTexto)
    ? (condicaoTexto as Condicao)
    : "novo";

  const categoriaTexto = texto(dados, "categoria_id");
  const categoria_id = categoriaTexto && ehUuid(categoriaTexto) ? categoriaTexto : null;

  const campos = {
    nome,
    codigo_peca: textoOuNulo(dados, "codigo_peca", 80),
    numero_serie: textoOuNulo(dados, "numero_serie", 80),
    marca_veiculo: textoOuNulo(dados, "marca_veiculo", 60),
    modelo_veiculo: textoOuNulo(dados, "modelo_veiculo", 80),
    ano_inicio: anoInicio,
    ano_fim: anoFim,
    condicao,
    descricao: textoOuNulo(dados, "descricao", 3000),
    preco,
    estoque: Number(estoqueTexto),
    categoria_id,
    ativo: dados.get("ativo") === "on",
  };

  if (id) {
    const { error } = await supabase.from("produtos").update(campos).eq("id", id);
    if (error) {
      console.error("Erro ao atualizar produto", error);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
  } else {
    const slug = `${criarSlug(nome) || "produto"}-${crypto.randomUUID().slice(0, 6)}`;
    const { error } = await supabase.from("produtos").insert({ ...campos, slug });
    if (error) {
      console.error("Erro ao cadastrar produto", error);
      return { erro: "Não foi possível salvar. Tente de novo." };
    }
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  redirect(id ? "/admin/produtos?aviso=salvo" : "/admin/produtos?aviso=criado");
}

export async function excluirProduto(dados: FormData) {
  const { supabase, perfil } = await exigirEquipe();
  const id = texto(dados, "id");
  if (perfil.papel !== "admin" || !ehUuid(id)) redirect("/admin/produtos");

  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) console.error("Erro ao excluir produto", error);

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  redirect(error ? "/admin/produtos?aviso=erro" : "/admin/produtos?aviso=excluido");
}
