"use client";

import { useActionState, useState } from "react";
import { entrar, type EstadoLogin } from "../actions";

const estadoInicial: EstadoLogin = { erro: null };

export default function FormularioLogin() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <form action={acao} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          className="mt-2 block w-full rounded-lg border border-mt-line bg-mt-steel px-4 py-3 text-base text-mt-white placeholder:text-mt-muted focus:border-mt-orange focus:outline-none"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium">
          Senha
        </label>
        <div className="relative mt-2">
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            className="block w-full rounded-lg border border-mt-line bg-mt-steel px-4 py-3 pr-20 text-base text-mt-white focus:border-mt-orange focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-sm text-mt-muted hover:text-mt-white"
            aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
          >
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {estado.erro && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-mt-orange px-4 py-3 text-base font-semibold text-mt-black transition hover:bg-mt-orange-dark disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
