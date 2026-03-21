export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Gwan Social Reputation — baseline de interface.</p>
        <p className="text-xs sm:text-right">
          API e dados em evolução. Nenhuma pontuação exibida aqui é real até integração com o backend.
        </p>
      </div>
    </footer>
  )
}
