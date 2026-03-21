export function HeroSection() {
  return (
    <section
      id="sobre"
      className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.15), transparent 45%), radial-gradient(circle at 80% 0%, rgba(99,102,241,0.2), transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/30">
          Plataforma de reputação social
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Reputação contextual, auditável e evolutiva
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Inspirada em narrativas de avaliação entre pessoas — com abordagem prática: interações
          registradas, avaliações controladas e processamento assíncrono para scores e histórico.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#entrada"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            Começar
          </a>
          <a
            href="#visao"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Ver visão do produto
          </a>
        </div>
      </div>
    </section>
  )
}
