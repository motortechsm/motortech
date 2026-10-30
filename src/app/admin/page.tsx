import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteServidor, lerConfigSupabase } from "@/lib/supabase/server";
import { sair } from "./actions";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const nomesPapel = { admin: "Administradora", vendedor: "Vendedor" } as const;

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

  return (
    <>
      <header className="border-b border-mt-line bg-mt-graphite">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">
            Motor<span className="text-mt-orange">Tech</span>
            <span className="ml-2 text-sm font-normal text-mt-muted">Painel</span>
          </span>
          <form action={sair}>
            <button
              type="submit"
              className="rounded-lg border border-mt-line px-3 py-2 text-sm text-mt-muted hover:border-mt-orange hover:text-mt-white"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {liberado ? (
          <>
            <h1 className="text-2xl font-bold">Olá, {nome}!</h1>
            <p className="mt-1 text-sm text-mt-muted">{papel ? nomesPapel[papel] : ""}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Produtos", "Pedidos", "Categorias", "Equipe"].map((item) => (
                <div key={item} className="rounded-xl border border-mt-line bg-mt-graphite p-5">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-1 text-sm text-mt-muted">Em construção</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-md rounded-xl border border-mt-line bg-mt-graphite p-6 text-center">
            <h1 className="text-xl font-bold">Acesso aguardando liberação</h1>
            <p className="mt-2 text-sm text-mt-muted">
              Sua conta foi criada, mas ainda precisa ser liberada pela administração da MotorTech.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
