"use client";

// Botão que pede confirmação antes de apagar algo.
export default function BotaoExcluir({
  acao,
  id,
  pergunta,
  rotulo = "Excluir",
}: {
  acao: (dados: FormData) => void | Promise<void>;
  id: string;
  pergunta: string;
  rotulo?: string;
}) {
  return (
    <form
      action={acao}
      onSubmit={(evento) => {
        if (!window.confirm(pergunta)) evento.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
      >
        {rotulo}
      </button>
    </form>
  );
}
