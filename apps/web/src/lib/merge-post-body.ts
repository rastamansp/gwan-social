/** Funde título + descrição legados do JSON ou devolve `content` quando já existir. */
export function mergedPostBody(fields: {
  content?: string | null
  title?: string | null
  description?: string | null
}): string {
  const c = typeof fields.content === 'string' ? fields.content.trim() : ''
  if (c.length > 0) return c
  const t = (fields.title ?? '').trim()
  const d = (fields.description ?? '').trim()
  if (!t && !d) return ''
  if (!t) return d
  if (!d) return t
  return `${t}\n\n${d}`
}
