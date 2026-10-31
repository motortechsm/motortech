import { redirect } from "next/navigation";
import { criarClienteServidor, lerConfigSupabase } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/tipos";

// Garante que quem está acessando é da equipe (logado e liberado).
// Se não for, manda para o login ou para a tela inicial do painel.
export async function exigirEquipe() {
  if (!lerConfigSupabase()) redirect("/admin/login");

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("perfis")
    .select("id, nome, papel, ativo")
    .eq("id", user.id)
    .maybeSingle();

  const perfil = data as Perfil | null;
  if (!perfil || !perfil.ativo) redirect("/admin");

  return { supabase, user, perfil };
}
