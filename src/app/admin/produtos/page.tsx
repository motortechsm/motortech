import type { Metadata } from "next";
import Link from "next/link";
import { exigirEquipe } from "@/lib/auth";
import { formatarPreco } from "@/lib/formato";
import CabecalhoPainel from "../CabecalhoPainel";

export const metadata: Metadata = {
  title: "Produtos",
  robots: { index: false, follow: false },
};

type Linha = {
  id: string;
  nome: string;
  codigo_peca: string | null;
  marca_veiculo: string | null;
  modelo_veiculo: string | null;
  preco: number;
  estoque: number;
  ativo: boolean;
};

const avisos: Record<string, { texto: string; erro?: boolean }> = {
  criado: { texto: "Produto cadastrado!" },
  salvo: { texto: "Alterações salvas!" },
  excluido: { texto: "Produto excluído." },
  erro: { texto: "Não foi possível concluir. Tente de novo.", erro: true },
};

export default async function PaginaProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aviso?: string }>;
}) {
  const { supabase, perfil } = await exigirEquipe();
  const { q = "", aviso } = await searchParams;
  const ehAdmin = perfil.papel === "admin";

  let consulta = supabase
    .from("produtos")
    .select("id, nome, codigo_peca, marca_veiculo, modelo_veiculo, preco, estoque, ativo")
    .order("criado_em", { ascending: false })
    .limit(300);

  // Remove caracteres que atrapalham a busca
  const termo = q.replace(/[%,()"\\*]/g, " ").trim().slice(0, 60);
  if (termo) {
    consulta = consulta.or(
      ["nome", "codigo_peca", "numero_serie", "marca_veiculo", "modelo_veiculo"]
        .map((campo) => `${campo}.ilike.%${termo}%`)
        .join(","),
    );
  }

  const { data, error } = await consulta;
  const produtos = (data ?? []) as Linha[];
  const mensagem = aviso ? avisos[aviso] : undefined;

  return (
    <>
      <CabecalhoPainel atual="produtos" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Produtos</h1>
          {ehAdmin && (
            <Link
              href="/admin/produtos/novo"
              className="rounded-lg bg-mt-orange px-4 py-3 text-sm font-semibold text-mt-black hover:bg-mt-orange-dark"
            >
              + Novo produto
            </Link>
          )}
        </div>

        {mensagem && (
          <p
            role="status"
            className={
              "mt-4 rounded-lg border px-4 py-3 text-sm " +
              (mensagem.erro
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-green-500/40 bg-green-500/10 text-green-300")
            }
          >
            {mensagem.texto}
          </p>
        )}

        <form className="mt-5 flex gap-2" role="search">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Buscar por nome, código ou carro"
            className="block w-full rounded-lg border border-mt-line bg-mt-steel px-4 py-3 text-base text-mt-white placeholder:text-mt-muted focus:border-mt-orange focus:outline-none"
          />
          <button type="submit" className="rounded-lg border border-mt-line px-4 text-sm text-mt-muted hover:text-mt-white">
            Buscar
          </button>
        </form>

        {error && (
          <p className="mt-6 text-sm text-red-300">Não foi possível carregar os produtos. Atualize a página.</p>
        )}

        {!error && produtos.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-mt-line p-8 text-center">
            {termo ? (
              <p className="text-mt-muted">Nenhum produto encontrado para “{termo}”.</p>
            ) : (
              <>
                <p className="font-semibold">Nenhum produto cadastrado ainda</p>
                <p className="mt-1 text-sm text-mt-muted">
                  {ehAdmin ? "Toque em “+ Novo produto” para cadastrar o primeiro módulo." : "A administradora ainda não cadastrou produtos."}
                </p>
              </>
            )}
          </div>
        )}

        <ul className="mt-6 space-y-3">
          {produtos.map((p) => {
            const veiculo = [p.marca_veiculo, p.modelo_veiculo].filter(Boolean).join(" ");
            const conteudo = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{p.nome}</p>
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-xs " +
                      (p.ativo ? "bg-green-500/15 text-green-300" : "bg-mt-steel text-mt-muted")
                    }
                  >
                    {p.ativo ? "Na loja" : "Oculto"}
                  </span>
                </div>
                {(p.codigo_peca || veiculo) && (
                  <p className="mt-1 text-sm text-mt-muted">
                    {[p.codigo_peca, veiculo].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-mt-orange">{formatarPreco(p.preco)}</span>
                  <span className={"ml-3 " + (p.estoque > 0 ? "text-mt-muted" : "text-red-300")}>
                    {p.estoque > 0 ? `${p.estoque} em estoque` : "Sem estoque"}
                  </span>
                </p>
              </>
            );
            return (
              <li key={p.id}>
                {ehAdmin ? (
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="block rounded-xl border border-mt-line bg-mt-graphite p-4 transition hover:border-mt-orange"
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <div className="rounded-xl border border-mt-line bg-mt-graphite p-4">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
