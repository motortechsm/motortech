import type { Metadata } from "next";
import FormularioLogin from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-2xl font-bold tracking-tight">
          Motor<span className="text-mt-orange">Tech</span>
        </p>
        <h1 className="mt-2 text-center text-sm text-mt-muted">Painel administrativo</h1>
        <FormularioLogin />
        <p className="mt-8 text-center text-xs text-mt-muted">
          Acesso restrito à equipe MotorTech.
        </p>
      </div>
    </main>
  );
}
