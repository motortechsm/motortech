import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes de cada acesso ao painel:
// 1. renova a sessão de login (cookies do Supabase);
// 2. manda quem não está logado para a tela de login.
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ehLogin = request.nextUrl.pathname === "/admin/login";

  if (!url || !chave) {
    // Sem configuração não há como verificar o login: o painel fica fechado.
    if (ehLogin) return resposta;
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
      },
    },
  });

  // getUser confere a sessão com o servidor do Supabase (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !ehLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && ehLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return resposta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
