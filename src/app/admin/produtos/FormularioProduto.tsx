"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { precoParaCampo } from "@/lib/formato";
import { CONDICOES, NOMES_CONDICAO, type Categoria, type Produto } from "@/lib/tipos";
import { salvarProduto, type EstadoFormulario } from "./actions";

const estadoInicial: EstadoFormulario = { erro: null };

const estiloCampo =
  "mt-2 block w-full rounded-lg border border-mt-line bg-mt-steel px-4 py-3 text-base text-mt-white placeholder:text-mt-muted focus:border-mt-orange focus:outline-none";

function Rotulo({ para, children, opcional }: { para: string; children: React.ReactNode; opcional?: boolean }) {
  return (
    <label htmlFor={para} className="block text-sm font-medium">
      {children}
      {opcional && <span className="ml-1 font-normal text-mt-muted">(opcional)</span>}
    </label>
  );
}

export default function FormularioProduto({
  produto,
  categorias,
}: {
  produto?: Produto;
  categorias: Pick<Categoria, "id" | "nome">[];
}) {
  const [estado, acao, enviando] = useActionState(salvarProduto, estadoInicial);

  // Envia sem limpar o formulário, para não perder o que foi digitado se houver erro.
  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => acao(dados));
  }

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <section className="space-y-5 rounded-xl border border-mt-line bg-mt-graphite p-5">
        <h2 className="font-semibold">Identificação</h2>

        <div>
          <Rotulo para="nome">Nome do módulo</Rotulo>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={produto?.nome ?? ""}
            placeholder="Ex.: Módulo de injeção ECU"
            className={estiloCampo}
          />
        </div>

        <div>
          <Rotulo para="categoria_id" opcional>
            Categoria
          </Rotulo>
          <select id="categoria_id" name="categoria_id" defaultValue={produto?.categoria_id ?? ""} className={estiloCampo}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {categorias.length === 0 && (
            <p className="mt-2 text-xs text-mt-muted">
              Nenhuma categoria ainda. Você pode criar em <Link href="/admin/categorias" className="text-mt-orange underline">Categorias</Link>.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Rotulo para="codigo_peca" opcional>
              Código da peça
            </Rotulo>
            <input id="codigo_peca" name="codigo_peca" defaultValue={produto?.codigo_peca ?? ""} autoCapitalize="characters" className={estiloCampo} />
          </div>
          <div>
            <Rotulo para="numero_serie" opcional>
              Número de série
            </Rotulo>
            <input id="numero_serie" name="numero_serie" defaultValue={produto?.numero_serie ?? ""} autoCapitalize="characters" className={estiloCampo} />
          </div>
        </div>

        <div>
          <Rotulo para="condicao">Condição</Rotulo>
          <select id="condicao" name="condicao" defaultValue={produto?.condicao ?? "novo"} className={estiloCampo}>
            {CONDICOES.map((c) => (
              <option key={c} value={c}>
                {NOMES_CONDICAO[c]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-mt-line bg-mt-graphite p-5">
        <h2 className="font-semibold">Veículo compatível</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Rotulo para="marca_veiculo" opcional>
              Marca
            </Rotulo>
            <input id="marca_veiculo" name="marca_veiculo" defaultValue={produto?.marca_veiculo ?? ""} placeholder="Ex.: Volkswagen" className={estiloCampo} />
          </div>
          <div>
            <Rotulo para="modelo_veiculo" opcional>
              Modelo
            </Rotulo>
            <input id="modelo_veiculo" name="modelo_veiculo" defaultValue={produto?.modelo_veiculo ?? ""} placeholder="Ex.: Gol 1.0" className={estiloCampo} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <Rotulo para="ano_inicio" opcional>
              Ano de
            </Rotulo>
            <input id="ano_inicio" name="ano_inicio" inputMode="numeric" maxLength={4} defaultValue={produto?.ano_inicio ?? ""} placeholder="2010" className={estiloCampo} />
          </div>
          <div>
            <Rotulo para="ano_fim" opcional>
              Ano até
            </Rotulo>
            <input id="ano_fim" name="ano_fim" inputMode="numeric" maxLength={4} defaultValue={produto?.ano_fim ?? ""} placeholder="2015" className={estiloCampo} />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-mt-line bg-mt-graphite p-5">
        <h2 className="font-semibold">Venda</h2>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <Rotulo para="preco">Preço (R$)</Rotulo>
            <input
              id="preco"
              name="preco"
              inputMode="decimal"
              defaultValue={produto ? precoParaCampo(produto.preco) : ""}
              placeholder="1500,00"
              className={estiloCampo}
            />
          </div>
          <div>
            <Rotulo para="estoque">Estoque</Rotulo>
            <input id="estoque" name="estoque" inputMode="numeric" defaultValue={produto?.estoque ?? 0} className={estiloCampo} />
          </div>
        </div>

        <div>
          <Rotulo para="descricao" opcional>
            Descrição
          </Rotulo>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            defaultValue={produto?.descricao ?? ""}
            placeholder="Detalhes, garantia, observações..."
            className={estiloCampo}
          />
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-mt-line bg-mt-steel p-4">
          <input type="checkbox" name="ativo" defaultChecked={produto?.ativo ?? false} className="mt-1 h-5 w-5 accent-mt-orange" />
          <span>
            <span className="block font-medium">Mostrar na loja</span>
            <span className="block text-sm text-mt-muted">
              Deixe desmarcado enquanto o cadastro não estiver pronto. Os clientes só veem produtos marcados.
            </span>
          </span>
        </label>

        <p className="text-xs text-mt-muted">As fotos poderão ser adicionadas depois.</p>
      </section>

      {estado.erro && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/admin/produtos"
          className="flex-1 rounded-lg border border-mt-line px-4 py-3 text-center text-base text-mt-muted hover:text-mt-white"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="flex-[2] rounded-lg bg-mt-orange px-4 py-3 text-base font-semibold text-mt-black transition hover:bg-mt-orange-dark disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </form>
  );
}
