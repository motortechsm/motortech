import Link from "next/link";
import { sair } from "./actions";

type Secao = "inicio" | "produtos" | "categorias";

const links: { secao: Secao; rotulo: string; href: string }[] = [
  { secao: "inicio", rotulo: "Início", href: "/admin" },
  { secao: "produtos", rotulo: "Produtos", href: "/admin/produtos" },
  { secao: "categorias", rotulo: "Categorias", href: "/admin/categorias" },
];

export default function CabecalhoPainel({ atual }: { atual?: Secao }) {
  return (
    <header className="border-b border-mt-line bg-mt-graphite">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Motor<span className="text-mt-orange">Tech</span>
          <span className="ml-2 text-sm font-normal text-mt-muted">Painel</span>
        </Link>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-lg border border-mt-line px-3 py-2 text-sm text-mt-muted hover:border-mt-orange hover:text-mt-white"
          >
            Sair
          </button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
        {links.map((l) => (
          <Link
            key={l.secao}
            href={l.href}
            className={
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm " +
              (atual === l.secao
                ? "bg-mt-steel font-semibold text-mt-white"
                : "text-mt-muted hover:text-mt-white")
            }
          >
            {l.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
