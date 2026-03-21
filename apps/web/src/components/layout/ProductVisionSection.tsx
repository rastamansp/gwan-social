const pillars = [
  {
    title: 'Contexto',
    body: 'Reputação por domínio ou cenário — não uma nota única de “valor humano”.',
  },
  {
    title: 'Rastreabilidade',
    body: 'Histórico de score e decisões alinhados à governança de arquitetura.',
  },
  {
    title: 'Processamento assíncrono',
    body: 'Cálculos pesados fora da API transacional, via worker e filas.',
  },
] as const

export function ProductVisionSection() {
  return (
    <section id="visao" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Visão da interface
        </h2>
        <p className="mt-3 text-slate-400">
          Esta camada apresenta apenas experiência e navegação. Regras de negócio e cálculo de
          reputação permanecem no backend e nos workers, conforme a baseline do projeto.
        </p>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {pillars.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm shadow-black/20"
          >
            <h3 className="text-sm font-semibold text-cyan-300">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
