// Página inicial provisória.
// O nome em texto abaixo é temporário: será substituído pela logo oficial da MotorTech.
// Nenhum produto, preço, telefone ou endereço é exibido até ser cadastrado pelo painel.

export default function Home() {
  return (
    <>
      <header className="border-b border-mt-line bg-mt-graphite">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <span className="text-lg font-bold tracking-tight">
            Motor<span className="text-mt-orange">Tech</span>
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-mt-orange">
            Módulos eletrônicos automotivos
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Nossa loja online está sendo preparada.
          </h1>
          <p className="mt-4 max-w-xl text-mt-muted">
            Em breve você poderá consultar módulos, verificar compatibilidade e comprar por aqui.
          </p>
          <div className="mt-8 h-1 w-24 rounded bg-mt-orange" aria-hidden="true" />
        </section>
      </main>

      <footer className="border-t border-mt-line bg-mt-graphite">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-mt-muted">
          © {new Date().getFullYear()} MotorTech
        </div>
      </footer>
    </>
  );
}
