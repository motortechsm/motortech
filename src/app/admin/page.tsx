import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { criarClienteServidor, lerConfigSupabase } from "@/lib/supabase/server";
import CabecalhoPainel from "./CabecalhoPainel";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const nomesPapel = { admin: "Administradora", vendedor: "Vendedor" } as const;

const atalhos = [
  { titulo: "Produtos", texto: "Cadastrar e editar módulos", href: "/admin/produtos" },
  { titulo: "Categorias", texto: "Organizar os tipos de módulo", href: "/admin/categorias" },
  { titulo: "Pedidos", texto: "Em breve", href: null },
  { titulo: "Equipe", texto: "Em breve", href: null },
];

export default async function PainelInicio() {
  if (!lerConfigSupabase()) redirect("/admin/login");

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, papel, ativo")
    .eq("id", user.id)
    .maybeSingle();

  const liberado = perfil?.ativo === true;
  const papel = perfil?.papel as keyof typeof nomesPapel | undefined;
  const nome = perfil?.nome || user.email;

  if (!liberado) {
    return (
      <>
        <CabecalhoPainel />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="mx-auto max-w-md rounded-xl border border-mt-line bg-mt-graphite p-6 text-center">
            <h1 className="text-xl font-bold">Acesso aguardando liberação</h1>
            <p className="mt-2 text-sm text-mt-muted">
              Sua conta foi criada, mas ainda precisa ser liberada pela administração da MotorTech.
            </p>
          </div>
        </main>
      </>
    );
  }

  const { count: totalProdutos } = await supabase
    .from("produtos")
    .select("id", { count: "exact", head: true });

  return (
    <>
      <CabecalhoPainel atual="inicio" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold">Olá, {nome}!</h1>
        <p className="mt-1 text-sm text-mt-muted">
          {papel ? nomesPapel[papel] : ""} · {totalProdutos ?? 0} produto(s) cadastrado(s)
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {atalhos.map((a) =>
            a.href ? (
              <Link
                key={a.titulo}
                href={a.href}
                className="rounded-xl border border-mt-line bg-mt-graphite p-5 transition hover:border-mt-orange"
              >
                <p className="font-semibold">{a.titulo}</p>
                <p className="mt-1 text-sm text-mt-muted">{a.texto}</p>
              </Link>
            ) : (
              <div key={a.titulo} className="rounded-xl border border-mt-line bg-mt-graphite p-5 opacity-60">
                <p className="font-semibold">{a.titulo}</p>
                <p className="mt-1 text-sm text-mt-muted">{a.texto}</p>
              </div>
            ),
          )}
        </div>
      </main>
    </>
  );
}
