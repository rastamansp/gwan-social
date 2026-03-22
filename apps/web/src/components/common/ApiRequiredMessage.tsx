/**
 * Mostrado quando `VITE_API_URL` não está definido — a SPA depende da API Nest + PostgreSQL.
 */
export function ApiRequiredMessage({ title = 'API necessária' }: { title?: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Define <code className="rounded bg-muted px-1.5 py-0.5 text-xs">VITE_API_URL</code> em{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">apps/web/.env</code> (ex.:{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">http://localhost:4000/api/v1</code>)
        e reinicia o Vite. Os dados vêm apenas da base de dados.
      </p>
    </div>
  )
}
