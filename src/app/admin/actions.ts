"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor, lerConfigSupabase } from "@/lib/supabase/server";

export type EstadoLogin = { erro: string | null };

export async function entrar(_anterior: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha." };
  }
  if (!lerConfigSupabase()) {
    return { erro: "O sistema ainda não foi configurado. Tente novamente mais tarde." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    // Mensagem genérica: não revela se o e-mail existe ou não.
    if (error.status === 429) {
      return { erro: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo." };
    }
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect("/admin");
}

export async function sair() {
  if (lerConfigSupabase()) {
    const supabase = await criarClienteServidor();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
