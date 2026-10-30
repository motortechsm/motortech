import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Lê as variáveis públicas do Supabase. Retorna null se ainda não estiverem configuradas
// (por exemplo, na verificação automática do GitHub, que não tem acesso a elas).
export function lerConfigSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return null;
  return { url, chave };
}

// Cliente do Supabase para usar no servidor (páginas e ações).
// Usa a sessão do usuário guardada nos cookies, então as regras de segurança (RLS) valem.
export async function criarClienteServidor() {
  const config = lerConfigSupabase();
  if (!config) {
    throw new Error("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  const armazenamento = await cookies();

  return createServerClient(config.url, config.chave, {
    cookies: {
      getAll() {
        return armazenamento.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) {
            armazenamento.set(name, value, options);
          }
        } catch {
          // Em páginas (Server Components) não é possível gravar cookies.
          // O proxy renova a sessão a cada acesso, então isso é seguro de ignorar.
        }
      },
    },
  });
}
