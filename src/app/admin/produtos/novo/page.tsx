import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirEquipe } from "@/lib/auth";
import CabecalhoPainel from "../../CabecalhoPainel";
import FormularioProduto from "../FormularioProduto";

export const metadata: Metadata = {
  title: "Novo produto",
  robots: { index: false, follow: false },
};

export default async function PaginaNovoProduto() {
  const { supabase, perfil } = await exigirEquipe();
  if (perfil.papel !== "admin") redirect("/admin/produtos");

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("ordem")
    .order("nome");

  return (
    <>
      <CabecalhoPainel atual="produtos" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Novo produto</h1>
        <FormularioProduto categorias={(categorias ?? []) as { id: string; nome: string }[]} />
      </main>
    </>
  );
}
